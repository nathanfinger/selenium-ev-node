import {sleep, evPegaInfosPedido, evListaPedidos, evPgVendas, closeDriver,currentUrl} from './common.js'
import {updateOrSaveDoc} from './db.js'



const startHandler = async ()=>{

    // página de pedidos
    await evPgVendas()
    let pedidos = await evListaPedidos()
    console.log('pedidos identificados na página da EV:')
    console.log(pedidos)


    // entrando na ediçaõ de cada um
    for (const nped of pedidos) {
        while ((await currentUrl()).includes('login')){
            await sleep(20)
        }
        try {
            await evPgVendas() // simular navegação pra tentar evitar de derrubarem a sessão
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
