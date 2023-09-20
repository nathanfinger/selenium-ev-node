import {getElements, getLinkEditar, evBuscaById, clickOnSelector, evPgCadastro, sendKeysToInput, sleep} from "./common.js";
import {getCapaByDoc, getLivrosColocarCapa, setPropertyOnDoc as l_setPropertyOnDoc} from "./db_livros.js";
import {resolve} from 'path'
import fs from 'fs'





const upcapa = async (doc,pathImg) => {
    let capa = pathImg || ''
    await sendKeysToInput('#form_capa', capa)
    await clickOnSelector('.btn-add-acervo')
}



async function downloadCapa(doc, path='./img_cadastro.jpg'){
    // let capa = await getCapaTeste();
    let capa = await getCapaByDoc(doc);
    
    await fs.promises.writeFile(path, capa.data);
    console.log('File saved successfully:', path);
}




async function cadastraCapa(doc){
    let path = './img_cadastro.jpg';
    path = resolve(path)

    try {
        await downloadCapa(doc, path);        
        await sleep(2)
        await evPgCadastro()
        await sleep(2)
        await upcapa(doc, path)
        await sleep(2)    
    } catch (error) {
        console.log('erro no cadastro do livro')
        console.log(error)
        return false
    }

    if(isProd()) await l_setPropertyOnDoc(doc,'colocadoCapaEv',true)
}



function isProd(){
    return false
}






async function pgEdicaoLivro(id_livro){
    await evBuscaById(id_livro)
    await getLinkEditar()
    return ;
}



async function startHandler(){
    let docs = await getLivrosColocarCapa(100)
    console.log(`Cadastrando batch de ${docs.length} livros.. `)     
    let n=0;
    for(let doc of docs){
        try {
            currentUrl()
        } catch (error) {
            console.log('Something went wrong, closing driver')
            break;
        }
        console.log(`livro (${++n}): ${doc.id} `)     
        await pgEdicaoLivro(doc.id)
        let ok = await cadastraCapa(doc)
        if(!ok) console.log('Livro nao cadastrado ... Ocorreu um erro!')
    }
}

await startHandler()


