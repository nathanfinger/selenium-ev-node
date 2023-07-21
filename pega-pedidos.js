import {sleep, evPegaInfosPedido, evListaPedidos, evPgVendas, closeDriver, currentUrl, evListaStatus} from './common.js'
import {updateOrSaveDoc} from './db.js'



const startHandler = async ()=>{

    // página de pedidos
    await evPgVendas(1)
    let pedidos = await evListaPedidos()
    let pedidosStatus = await evListaStatus()

    // pagina 2
    await sleep(2)
    await evPgVendas(2)
    pedidos = pedidos.concat(await evListaPedidos())
    pedidosStatus = pedidosStatus.concat(await evListaStatus())

    console.log('Pedidos identificados:')
    console.log(pedidos)


    // TODO filtrar status que não mudaram
    // por aqui já é possível identificar o statusEv pra fazer o scraping só dos pedidos que mudaram statusEv
    // console.log(pedidosStatus)


    // entrando na ediçaõ de cada um
    for (const nped of pedidos) {
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

startHandler()
