import {
    sleep,
    closeDriver,
    evPgPedido,
    evSetTrackingCode, evPgVendasStandyBy, evPgVendasDelayed, evListaPedidos
} from './common.js'
import {getTableDocWithProperty} from './db.js'



const rastreioNoPedidoEv = async function (id_ev,codigo_rastreio, save=true){
    try {
        await sleep(1)
        await evPgPedido(id_ev)
        await evSetTrackingCode(codigo_rastreio, save)
        await sleep(1)
    } catch (e) {
        closeDriver()
    }
}



const startHandler = async ()=>{
    // página de pedidos a serem enviados
    await evPgVendasStandyBy()
    await sleep(2)
    let pedidos = await evListaPedidos()

    // página de pedidos atrasados
    await evPgVendasDelayed()
    await sleep(2)
    let pedidos2 = await evListaPedidos()
    pedidos = pedidos.concat(pedidos2)




    for (const pedido of pedidos) {
        console.log(`Pedido ${pedido}`)
        // procura pedido na expedicao
        const docExp = (await(getTableDocWithProperty('local_mysql_expedicao', 'info_intermediario', pedido)))[0]

        // procura na tabela da expedição
        if(docExp === undefined ) {
            console.log(`Não encontrado no banco expedição : (ev) = ${pedido}`)
            continue;
        }
        if(docExp.id_intermediario!== undefined && docExp.id_intermediario!==1) {
            console.log(`Não encontrado na expedição com id_intermediario==1: (ev) = ${pedido} `)
            continue;
        }

        // se ainda não passou pela expedição completamente, não coloca o codigo pois pode ter livro perdido
        if(! docExp.checkout === true) {
            console.log(`ainda não passou pela expedição completamente : (ev) = ${pedido}`)
            continue;
        }



        // com o id_cesta da expedicao, pega o cod_rastreio da portal_postal
        const docPortalPostal = (await(getTableDocWithProperty('portal_postal', 'id_cesta', ''+docExp.id_cesta)))[0]
        const cod_rastreio = docPortalPostal.cod_rastreio
        console.log(`pedido : ${pedido}, cod_rastreio : ${cod_rastreio}`)

        if(cod_rastreio !== undefined){
            await rastreioNoPedidoEv(pedido, cod_rastreio, true)
            await sleep(2)
        }
    }


}


// main handler
try {
    await startHandler()
    closeDriver()
} catch (e) {
    console.log('Found an error... Closing driver')
    console.log(e)
    await sleep(10)
    closeDriver()
}

