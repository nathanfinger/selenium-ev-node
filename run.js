import {
    evBuscaById,
    clickOnSelector,
    acceptAlert,
    sleep,
    closeDriver,
    countElements,
} from './common.js'

import {getLivroWithoutProperty,setPropertyOnDoc} from './db.js'


async function removeFromEv(id) {
    await evBuscaById(id)
    let count = await countElements(`.acervo-item`)
    console.log(`Itens encontrados: ${count}`)
    if(count>0){
        await clickOnSelector('.acervo-item')
        await clickOnSelector('.action-checked')
        await sleep(0.5)
        await acceptAlert()
        return true
    }
    if(count===0){
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
        let _ok = false
        console.log(`Starting removal of id: ${livro[0].id_livro}`)
        await sleep(1)
        _ok = await removeFromEv(livro[0].id_livro)
        console.log(`Livro fora da EV: ${_ok}`)
        if(_ok){
            console.log("Removed from ev... updating on DB. ")
            await setPropertyOnDoc(livro[0],'removedFromEv',true)
        }
        return startHandler(n+1, maxN)
    }
}




startHandler(1, 10)



