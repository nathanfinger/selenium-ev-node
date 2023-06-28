import {
    sleep,
    closeDriver,
    evPgPedido,
    evSetTrackingCode
} from './common.js'
import {updateOrSaveDoc} from './db.js'



const rastreioNoPedidoEv = function (id_ev,codigo_rastreio){
    try {
        await sleep(1)
        await evPgPedido(id_ev)
        await evSetTrackingCode(codigo_rastreio)
        await sleep(1)
    } catch (e) {
        closeDriver()
    }
}


function db_get_pedidos_sem_rastreio_com_codigo_disponivel(){
    pedido.doc = getDoc('???')
    pedido.rastreio = getDoc('???')
}

const startHandler = async ()=>{
    let pedidos = db_get_pedidos_sem_rastreio_com_codigo_disponivel()


    for (const pedido of pedidos) {
        await rastreioNoPedidoEv(pedido.pedido,pedido.codigo_rastreio)
        await updateOrSaveDoc(pedido.doc, 'pedidos', 'pedido', infos.pedido)
    }


    console.log('Closing driver')
    await sleep(10)
    closeDriver()
}

// startHandler()