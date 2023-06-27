import {sleep, evPegaInfosPedido, evListaPedidos, evPgVendas, closeDriver} from './common.js'
import {updateOrSaveDoc} from './db.js'



const startHandler = async ()=>{
    await evPgVendas()
    let pedidos = await evListaPedidos()
    console.log(pedidos)
    for (const nped of pedidos) {
            try {
                await sleep(2)
                let infos = await evPegaInfosPedido(nped)
                infos = {...infos, origem: 'ev'}
                await updateOrSaveDoc(infos, 'pedidos', 'pedido', infos.pedido)
            } catch (e) {
                closeDriver()
            }

    }
    await sleep(10)
    closeDriver()
}

startHandler()