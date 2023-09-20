import {
    log,
    evBuscaById,
    clickOnSelector,
    acceptAlert,
    sleep,
    closeDriver,
    countElements,
    currentUrl,
    driver
} from './common.js'

import {getConfig, countLivrosWithoutProperty, getLivroWithoutProperty, setPropertyOnDoc} from './db.js'
import {getLivrosNaoDisponiveisWithProperty, getLivrosWithProperty as l_getLivrosWithProperty, setPropertyOnDoc as l_setPropertyOnDoc} from "./db_livros.js";




async function removeVendidoFromEv(livro) {
    await evBuscaById(livro.id_livro)

    let count = await countElements(`.acervo-item`)
    console.log(`Itens encontrados: ${count}`)
    if(count>0){
        await clickOnSelector('.acervo-item')
        await clickOnSelector('.action-checked')
        await sleep(0.5)

        await acceptAlert()
        await setPropertyOnDoc(livro,'removedFromEv',true)
        return true
    }
    while ((await currentUrl()).includes('login')){
        await sleep(20)
    }
    if(count===0 && !(await currentUrl()).includes('login')){
        await setPropertyOnDoc(livro,'removedFromEv',true)
        await setPropertyOnDoc(livro,'alreadyRemovedFromEv',true)
        return true
    }

}
async function removeIndisponivelFromEv(livro) {
    await evBuscaById(livro.id)

    let count = await countElements(`.acervo-item`)
    console.log(`Itens encontrados: ${count}`)
    if(count>0){
        await clickOnSelector('.acervo-item')
        await clickOnSelector('.action-checked')
        await sleep(0.5)

        await acceptAlert()
        await l_setPropertyOnDoc(livro,'removedFromEv',true)
        await l_setPropertyOnDoc(livro,'colocadoEv',false)
        return true
    }
    while ((await currentUrl()).includes('login')){
        await sleep(20)
    }
    if(count===0 && !(await currentUrl()).includes('login')){
        await l_setPropertyOnDoc(livro,'removedFromEv',true)
        await l_setPropertyOnDoc(livro,'alreadyRemovedFromEv',true)
        await l_setPropertyOnDoc(livro,'colocadoEv',false)
        return true
    }

}








async function startHandler(n= 1,maxN= 10){
    let nothing = false
    if(n>maxN){
        console.log('maxN reached')
        closeDriver()
        return true;
    }
    console.log(`handler ${n} / ${maxN}`)

    let livro = await getLivroWithoutProperty(config.propRemovido)
    if (livro.length===0) {
        nothing = true
    } else {
        console.log(`Retirando o livros da EV que passou pela expedição: ${livro[0].id_livro}`)
        await sleep(1)
        await removeVendidoFromEv(livro[0])
        return startHandler(n+1, maxN)
    }


    let retirarEv = await getLivrosNaoDisponiveisWithProperty(config.propColocado,true)
    if (nothing && retirarEv.length===0) {
        console.log('Nada a retirar..')
        closeDriver()
        log({robot:'run', log: `Sem mais livros para remover`})
        return 'Sem livros para remover';
    } else {
        log({robot:'run', log: `Retirando agora os livros da EV que não estão no status 4...`})

        for (let book of retirarEv){
            console.log(`Starting removal of id: ${book.id}`)
            await sleep(1)
            await removeIndisponivelFromEv(book)
            log({robot:'run', log: `Removido o livro de id: ${book.id}`})
        }
    }
    await startHandler(n+1, maxN)
}










var defaultConfig = {
    _id: 'config-robots-ev',
    _rev: '1-0c1fe6ff18a2b33167d1043ac11435ae',
    remover: {
        propCadastrado: "colocadoEv",
        browserHeadless: false,
        chromeProfilePath: "./profiles/chrome1",
        shuffleOrder: true,
        propRemovido: "removidoEv",
        queue_max:1000
      }
}

let configImported = await getConfig()
let config = {...defaultConfig, ...configImported}
config = config.remover
let queue_max = config.queue_max



log({robot:'run', log: `Iniciando handler`})
try {
    // abre driver em profile diferente
    driver({
        'profile': config.chromeProfilePath,
        'headless': config.browserHeadless
    })

    await startHandler(1, queue_max)
    console.log('All Done..')
    await sleep(5)
    closeDriver()
} catch (e) {
    console.log('Found an Error..')
    console.log(e)
    closeDriver()
}
log({robot:'run', log: `Finalizando handler`})
