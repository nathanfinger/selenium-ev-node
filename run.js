import {
    evBuscaById,
    clickOnSelector,
    acceptAlert,
    sleep,
    closeDriver,
    countElements,
} from './common.js'

import {getLivroWithoutProperty,setPropertyOnDoc} from './db.js'


async function removeFromEv(livro) {
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
    if(count===0){
        await setPropertyOnDoc(livro,'removedFromEv',true)
        await setPropertyOnDoc(livro,'alreadyRemovedFromEv',true)
        return true
    }

}


async function startHandler(n= 1,maxN= 10){
    if(n>maxN) return true;
    console.log(`handler ${n} / ${maxN}`)

    let livro = await getLivroWithoutProperty('removedFromEv')
    if (livro.length===0) {
        return 'Sem livros para remover';
    } else {
        console.log(`Starting removal of id: ${livro[0].id_livro}`)
        await sleep(1)
        await removeFromEv(livro[0])
        return startHandler(n+1, maxN)
    }
}


startHandler(1, 7000)



