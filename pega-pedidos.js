import {driver, log,sleep,evPegaInfosPedido,evListaPedidos,evPgVendas,closeDriver,currentUrl,evListaStatus,evPgVendasStandyBy,evPgVendasCancelled} from './common.js'
import {getTableDocWithProperty, updateOrSaveDoc, getConfig} from './db.js'


const startHandler = async (config)=>{

    // pagina 1 de pedidos
    await evPgVendas(1)
    await sleep(1)
    let pedidos = await evListaPedidos()
    let pedidosStatus = await evListaStatus()
    let pedidosDiff = []

    // pagina 2 de pedidos
    await evPgVendas(2)
    await sleep(1)
    pedidos = pedidos.concat(await evListaPedidos())
    pedidosStatus = pedidosStatus.concat(await evListaStatus())

    // pagina 1 de 'aguardando envio'
    await evPgVendasStandyBy()
    await sleep(1)
    pedidos = pedidos.concat(await evListaPedidos())
    pedidosStatus = pedidosStatus.concat(await evListaStatus())

    // pagina 1 de 'Cancelado'
    await evPgVendasCancelled()
    await sleep(1)
    pedidos = pedidos.concat(await evListaPedidos())
    pedidosStatus = pedidosStatus.concat(await evListaStatus())
    
    console.log(pedidosStatus[0])
    await sleep(1)

    // filtrar status que não mudaram
    // por aqui já é possível identificar o statusEv pra fazer o scraping só dos pedidos que mudaram statusEv
    log({robot:'pega-pedidos', log: `Avaliando ${pedidos.length} pedidos`})
    for (let i in pedidos){
        // pedido da vez
        const pNumber = pedidos[i]
        const pStatus = pedidosStatus[i]
        console.log(`Avaliando pedido ${pNumber} - ${pStatus}`)

        // busca ele no banco
        const docs = await(getTableDocWithProperty('pedidos', 'pedido', pNumber))

        // avalia se atualiza ou não
        if(!docs || !docs.length || (docs[0] && docs[0].statusEv && docs[0].statusEv !== pedidosStatus[i])){
            if(!pedidosDiff.includes(pNumber)) pedidosDiff.push(pNumber)
            console.log(`pedido ${pNumber} sera atualizado: status ${docs && docs[0] && docs[0].statusEv ? docs[0].statusEv : 'sem status'} -> ${pedidosStatus[i]}`)
        } else {
            console.log(`pedido ${pNumber} NAO sera atualizado: status ${docs && docs[0] && docs[0].statusEv ? docs[0].statusEv : 'sem status'} -> ${pedidosStatus[i]}`)
        }
    }

    // tem que testar, mas teoricamente a princípio é só trocar o pedidos por pedidosDiff aqui no nped do for .. of
    log({robot:'pega-pedidos', log: `Iniciando importação de ${pedidosDiff.length} Pedidos com mudança`})



    // entrando na ediçaõ de cada um
    for (const nped of pedidosDiff) {
        if((await currentUrl()).includes('login')){
            console.log('browser asking for login credentials')
            log({robot:'pega-pedidos', log:'browser asking for login credentials'})
            await sleep(20)
            break;
        }
        try {
            // await evPgVendas() // simular navegação pra tentar evitar de derrubarem a sessão
            await sleep(1)
            let infos = await evPegaInfosPedido(nped)
            infos = {...infos, origem: 'ev'}
            await updateOrSaveDoc(infos, 'pedidos', 'pedido', infos.pedido)
            log({robot:'pega-pedidos', log: `Atualizado pedido ${infos.pedido}`})
        } catch (e) {
            console.log(e)
            closeDriver()
        }
    }
    console.log('Closing driver')
    await sleep(3)
    closeDriver()
}




// ------------------------------------------------
// configurações default, caso o banco não exista etc
var defaultConfig = {
    _id: 'config-robots-ev',
    _rev: '1-0c1fe6ff18a2b33167d1043ac11435ae',
    pegaPedidos:{
        browserHeadless: false,
        chromeProfilePath: './profiles/chrome1',
    }
}

// configurações do banco
let configImported = await getConfig()
let config = {...defaultConfig, ...configImported}
config = config.pegaPedidos

// ------------------------------------------------



// main handler
log({robot:'pega-pedidos', log: 'Iniciando handler'})
try {
    await startHandler(config)
    closeDriver()
} catch (e) {
    closeDriver()
}
log({robot:'pega-pedidos', log: 'Fim do handler'})

