import {log,evBuscaById,clickOnSelector,acceptAlert,sleep,closeDriver,countElements,currentUrl,driver} from './common.js'
import {getConfig} from './db.js'
import {getFromLivrosView, setPropertyOnDoc} from "./db_livros.js";



// remove livro fora do status 4 da EV e atualiza propriedades
async function removeIndisponivelFromEv(livro) {

    // busca um livro no acervo
    await evBuscaById(livro.id)

    // se pediu login, para
    while ((await currentUrl()).includes('login')){
        console.log('Browser might be asking for login credentials')
        await sleep(20)
    }

    // procura os resultados  
    let count = await countElements(`.acervo-item`)
    console.log(`Itens encontrados: ${count}`)


    // se encontrou resultados, retira os livros e marca como retirado
    if(count>0){
        await clickOnSelector('.acervo-item')
        await clickOnSelector('.action-checked')
        await sleep(0.5)

        await acceptAlert()
        await setPropertyOnDoc(livro,'removedFromEv',true)
        await setPropertyOnDoc(livro,'colocadoEv',false)
        log({robot:'run', log: `Livro ${livro.id} removido da EV, atualizando cadastro.`})

        return true
    }

    // se não encontrou resultados, marca como retirado
    if(count===0 && !(await currentUrl()).includes('login')){
        await setPropertyOnDoc(livro,'removedFromEv',true)
        await setPropertyOnDoc(livro,'alreadyRemovedFromEv',true)
        await setPropertyOnDoc(livro,'colocadoEv',false)
        log({robot:'run', log: `Livro ${livro.id} não encontrado na EV, atualizando cadastro.`})

        return true
    }
}



// handler de remoção dos livros
async function startHandler(docs){
    let counter = 0

    // tem livros pra remover?
    if(docs.length<1) {
        console.log('nada a remover')    
        return ;
    }

    // else ... remove cada um 
    for (let doc of docs){
        console.log(` --> Iniciando Remoção do livro de id = ${doc.id} (${++counter} / ${docs.length})`)
        await removeIndisponivelFromEv(doc)
    }
}




// confogurações default, para caso não carregue do banco
var defaultConfig = {
    _id: 'config-robots-ev',
    _rev: '1-0c1fe6ff18a2b33167d1043ac11435ae',
    remover: {
        propCadastrado: "colocadoEv",
        browserHeadless: false,
        chromeProfilePath: "./profiles/chrome1",
        shuffleOrder: true,
        propRemovido: "removidoEv",
        queue_max:1000,
        batchSize:200
    }
}

// carrega configurações do banco
let configImported = await getConfig()
let config = {...defaultConfig, ...configImported}
config = config.remover





// pega livros
let docs = await getFromLivrosView(config.batchSize)


// inicia handler   
log({robot:'run', log: `Iniciando handler`})
try {
    // abre driver em profile específico (config)
    driver({
        'profile': config.chromeProfilePath,
        'headless': config.browserHeadless
    })

    // Starta o handler recursivo
    await startHandler(docs)
    console.log('All Done..')
    await sleep(5)
    closeDriver()
} catch (e) {
    console.log('Found an Error..')
    console.log(e)
    closeDriver()
}
log({robot:'run', log: `Finalizando handler`})
