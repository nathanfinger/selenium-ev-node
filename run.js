import {
    get,
    evBuscaById,
    clickOnSelector,
    acceptAlert,
    sleep,
    closeDriver,
    countElements,
} from './common.js'


async function removeFromEv(id) {
    await evBuscaById(id)
    let count = await countElements(`.acervo-item`)
    console.log(`Itens encontrados: ${count}`)
    if(count>0){
        clickOnSelector('.acervo-item')
        clickOnSelector('.action-checked')
        sleep(0.5)
        acceptAlert()
    } else {
        // Nothing to do .. ?
    }
}

let id = 123456
removeFromEv(id)



