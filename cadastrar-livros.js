import {getProperties, log, driver, closeDriver, clickOnSelector, evPgCadastro, sendKeysToInput, sleep, currentUrl} from "./common.js";
import {getLivrosColocarEvBetweenIds, getCapaByDoc, setPropertyOnDoc as l_setPropertyOnDoc, saveErroCadastro} from "./db_livros.js";
import {getConfig} from "./db.js";

import {resolve} from 'path'
import fs from 'fs'




const sel = {
    isbn: '#form_isbn',
    barcode: '#form_barcode',
    estante: '#form_estante',
    idioma: '#form_idioma',
    autor: '#form_autor',
    titulo: '#form_titulo',
    editora: '#form_editora',
    ano: '#form_ano',
    edition: '#form_edition',
    preco: '#form_preco',
    peso: '#form_peso',
    descricao: '#form_descricao',
    category: '#form_category',
    location_in_store: '#form_location_in_store',
}

const preencheForm = async (doc,pathImg) => {

    let isbn = doc.isbnEv || doc.isbn || ''
    let estante = doc.assuntoEv || doc.assunto
    let autor = doc.autorEv || doc.autor
    let titulo = doc.tituloEv || doc.titulo
    let editora = doc.editoraEv || doc.editora
    let ano = doc.anoEdicaoEv || doc.anoEdicao
    let preco = doc.precoEv || doc.precoVenda
    let peso = doc.pesoEv || doc.peso
    let descricao = doc.obsEstadoConservacao
    let capa = pathImg || ''

    // conjunto de regras

    // padrão da EV: editora em lowercase
    estante = estante.split('.')[0]
    editora = editora.replace('editora ','').replace(' editora','').replace('editora','')
    editora = editora.toLowerCase()

    // preço mínimo para a EV
    let precoMin = 9.901
    if(config.setarPrecoMinimoEv) precoMin = parseFloat(config.setarPrecoMinimoEv);
    if (preco < precoMin) preco = precoMin;
    preco = preco.toFixed(2).toString().replace('.',',')

    // Ajuste na descrição
    descricao = `ID ${doc.id}. ${descricao}; Imagem correspondente ao exemplar anunciado.`
    descricao = descricao.replace('.;','.')

    // isbn obrigatório na EV em livros a partir de 1990
    if(!isbn && parseInt(ano)>=1990 && parseInt(ano)<=1994) ano = '1989';   

    // Caso sem autor
    if(!autor) autor = 'Equipe Editorial';

    
    await sendKeysToInput('#form_estante', 'outr')
    await sendKeysToInput('#form_isbn', isbn)
    await sendKeysToInput('#form_capa', capa)
    await sendKeysToInput('#form_autor', autor)
    await sendKeysToInput('#form_ano', ano)
    await sendKeysToInput('#form_titulo', titulo)
    await sendKeysToInput('#form_editora', editora)
    await sendKeysToInput('#form_preco', preco)
    await sendKeysToInput('#form_descricao', descricao)
    await sendKeysToInput('#form_estante', estante)
    await sendKeysToInput('#form_peso', peso)

    if(isProd()) {
        console.log('...salvando...')
        await clickOnSelector('.btn-add-acervo')       
    }

    let waitx = config.esperarSegundosAposSalvar || 5
    await sleep(waitx)
    let url = await currentUrl()
    if(url.includes('/acervo/editar')){
        let errors = await getProperties('.error', 'innerHTML')
        await saveErroCadastro(doc, errors)

        throw new Error('Ocorreu algum erro inesperado nos dados de cadastro do livro');
    }
}



async function downloadCapa(doc, path='./img_cadastro.jpg'){
    // let capa = await getCapaTeste();
    let capa = await getCapaByDoc(doc);
    
    await fs.promises.writeFile(path, capa.data);
    console.log('File saved successfully:', path);
}




async function cadastraDoc(doc){
    let path = './img_cadastro.jpg';
    path = resolve(path)

    try {
        await downloadCapa(doc,path);        
        await sleep(0.5)
        await evPgCadastro()
        await sleep(0.5)
        await preencheForm(doc, path)
        await sleep(0.5)    
    } catch (error) {
        console.log('erro no cadastro do livro')
        console.log(error)
        return false
    }

    if(isProd()) await l_setPropertyOnDoc(doc,'colocadoEv',true)

    return true
}





function testConditionsToIgnore(doc,config){

    // rodando 'manualmente' num range sem essa prop
    // if(!doc[config.propCadastrar]) return true ;

    if(doc.id > config.ignoraIdMaiorQue ) return true ;
    if(doc.id < config.ignoraIdMenorQue ) return true ;

    if(!doc.precoEv && doc.precoVenda < config.ignoraPrecoMenorQue ) return true ;
    if(doc.precoEv && doc.precoEv < config.ignoraPrecoMenorQue ) return true ;

    if(!doc.precoEv && doc.precoVenda > config.ignoraPrecoMaiorQue ) return true ;
    if(doc.precoEv && doc.precoEv > config.ignoraPrecoMaiorQue ) return true ;

    if(doc.obsEstadoConservacao.includes(config.ignoraSeDescricaoContemTexto)) return true ;

    let tempoCadastro = Date.now() - (new Date(doc.dataEntrada))
    if( tempoCadastro/(1000*60*60) < config.afterCadastroWaitHours) return true ;
}



async function startHandler(config){
    
    console.log('Buscando livros no banco')
    // rodando 'manualmente' num range
    // let docs = await getLivrosColocarEv(50)
    let docs =  await getLivrosColocarEvBetweenIds(1568849,1999999, config.maxItems)


    log({robot:'cadastrar-livros', log: `Buscado no banco ${docs.length} para cadastro`})

    if(!docs) return ;
    console.log(`Cadastrando batch de ${docs.length} livros.. `)     
    let n=0;

    // abre driver em profile diferente
    driver({
        'profile': config.chromeProfilePath,
        'headless': config.browserHeadless
    })

    if(config.shuffleOrder){
        docs.sort( () => .5 - Math.random() );
    }
    docs.sort( (a,b) => {
        if(b.errorsCadastro && a.errorsCadastro) return a.errorsCadastro - b.errorsCadastro
        return b.errorsCadastro? -1 : 1 
    })

    log({robot:'cadastrar-livros', log: `Iniciando cadastro`})
    for(let doc of docs){
        console.log(`livro (${++n}): ${doc.id} `)     
        try {
            currentUrl()
        } catch (error) {
            console.log('Something went wrong... closing driver')
            closeDriver()
        }        

        if (testConditionsToIgnore(doc,config)){
            console.log('Livro nao cadastrado ... Ignorado por causa das regras!')                
        } else {
            let ok = await cadastraDoc(doc)
            if(!ok) console.log('Livro nao cadastrado ... Ocorreu um erro!')    
        }

    }
    log({robot:'cadastrar-livros', log: `Finalizando cadastro`})
}





var defaultConfig = {
    _id: 'config-robots-ev',
    _rev: '1-0c1fe6ff18a2b33167d1043ac11435ae',
    cadastrar:{
        propCadastrar: 'disponibilizarEv',
        afterCadastroWaitHours: 72,
        capaAttachment: 'capa.jpg',
        ignoraIdMaiorQue: 999999999,
        ignoraIdMenorQue: 0,
        ignoraPrecoMaiorQue: 999999999,
        ignoraPrecoMenorQue: 1,
        ignoraSeDescricaoContemTexto: 'Livro Exclusivo Fora da Ev',
        salvarLivros: true,
        esperarSegundosAposSalvar: 6,
        browserHeadless: false,
        chromeProfilePath: './profiles/chrome1',
        shuffleOrder: true,
        maxItems:1000
    }
}

function isProd(){
    return config.salvarLivros || config.salvarLivros===undefined
}


let configImported = await getConfig()
let config = {...defaultConfig, ...configImported}
config = config.cadastrar


log({robot:'cadastrar-livros', log: 'Iniciando handler'})

await startHandler(config)

log({robot:'cadastrar-livros', log: 'Finalizando operação'})


