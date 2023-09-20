import {
    log,
    sleep,
    evPegaInfosPedido,
    evListaPedidos,
    evPgVendas,
    closeDriver,
    currentUrl,
    evListaStatus,
    evPgVendasStandyBy,
} from './common.js'
import {getTableDocWithProperty, updateOrSaveDoc} from './db.js'



const startHandler = async ()=>{

    // página de pedidos
    await evPgVendas(1)
    await sleep(2)
    let pedidos = await evListaPedidos()
    let pedidosStatus = await evListaStatus()
    let pedidosDiff = []

    // pagina 2
    await evPgVendas(2)
    await sleep(2)
    pedidos = pedidos.concat(await evListaPedidos())
    pedidosStatus = pedidosStatus.concat(await evListaStatus())

    // pagina 1 de 'aguardando envio'
    await evPgVendasStandyBy()
    await sleep(2)
    pedidos = pedidos.concat(await evListaPedidos())
    pedidosStatus = pedidosStatus.concat(await evListaStatus())


    // filtrar status que não mudaram
    // por aqui já é possível identificar o statusEv pra fazer o scraping só dos pedidos que mudaram statusEv
    log({robot:'pega-pedidos', log: `Avaliando ${pedidos.length} pedidos`})
    for (let i in pedidos){
        const pNumber = pedidos[i]
        const docs = await(getTableDocWithProperty('pedidos', 'pedido', pNumber))
        if(docs.length===0 || docs[0].statusEv !== pedidosStatus[i]){
            pedidosDiff.push(pNumber)
        }
    }

    // tem que testar, mas teoricamente a princípio é só trocar o pedidos por pedidosDiff aqui no nped do for .. of
    log({robot:'pega-pedidos', log: `Iniciando importação de ${pedidosDiff.length} Pedidos com mudança`})


    // entrando na ediçaõ de cada um
    for (const nped of pedidosDiff) {
        while ((await currentUrl()).includes('login')){
            await sleep(20)
        }
        try {
            // await evPgVendas() // simular navegação pra tentar evitar de derrubarem a sessão
            await sleep(1)
            let infos = await evPegaInfosPedido(nped)
            infos = {...infos, origem: 'ev'}
            await updateOrSaveDoc(infos, 'pedidos', 'pedido', infos.pedido)
        } catch (e) {
            console.log(e)
            closeDriver()
        }
    }
    console.log('Closing driver')
    await sleep(30)
    closeDriver()
}




// main handler
log({robot:'pega-pedidos', log: 'Iniciando handler'})
try {
    await startHandler()
    closeDriver()
} catch (e) {
    closeDriver()
}
log({robot:'pega-pedidos', log: 'Fim do handler'})

