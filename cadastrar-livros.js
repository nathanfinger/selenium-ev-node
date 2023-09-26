import {getProperties, log, driver, closeDriver, clickOnSelector, evPgCadastro, sendKeysToInput, sleep, currentUrl} from "./common.js";
import {getLivrosColocarEvBetweenIds, getLivrosColocarEv, getCapaByDoc, setPropertyOnDoc, saveErroCadastro} from "./db_livros.js";
import {getConfig} from "./db.js";
import {resolve} from 'path'
import fs from 'fs'



// artifício para testes
function isProd(){
    return config.salvarLivros || config.salvarLivros===undefined
}


// DICIONÁRIO DE SELETORES PRO CADASTRO
const evSelectors = {
    error: '.error',
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
    // seta os campos todos
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

    // padrão da EV: editora em lowercase
    estante = estante.split('.')[0]
    editora = editora.toLowerCase()
    editora = editora.replace('editora ','').replace(' editora','').replace('editora','')

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
    
    await sendKeysToInput(evSelectors['estante'], 'outr')
    await sendKeysToInput(evSelectors['isbn'], isbn)
    await sendKeysToInput(evSelectors['capa'], capa)
    await sendKeysToInput(evSelectors['autor'], autor)
    await sendKeysToInput(evSelectors['ano'], ano)
    await sendKeysToInput(evSelectors['titulo'], titulo)
    await sendKeysToInput(evSelectors['editora'], editora)
    await sendKeysToInput(evSelectors['preco'], preco)
    await sendKeysToInput(evSelectors['descricao'], descricao)
    await sendKeysToInput(evSelectors['estante'], estante)
    await sendKeysToInput(evSelectors['peso'], peso)

    // artifício para testes
    if(isProd()) {
        console.log(' ✔️  salvando   ')
        await clickOnSelector('.btn-add-acervo')       
    }

    // pra não depender exclusivamente do selenium, vou esperar um tempo
    let waitx = config.esperarSegundosAposSalvar || 5
    await sleep(waitx)

    // testa se a URL ocntinua a mesma (falha)
    // se encontrar erros registra
    let url = await currentUrl()
    if(url.includes('/acervo/editar')){
        let errors = await getProperties(evSelectors['error'], 'innerHTML')
        await saveErroCadastro(doc, errors)
        throw new Error('Ocorreu algum erro inesperado nos dados de cadastro do livro');
    }
}

// download da capa, dado o doc
async function downloadCapa(doc, path='./img_cadastro.jpg'){
    let capa = await getCapaByDoc(doc);   
    await fs.promises.writeFile(path, capa.data);
    console.log(' ⬇️ File saved successfully:', path);
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
        log({robot:'cadastrar-livros', log:`erro no cadastro do livro ${doc.id}`})
        console.log(error)
        return false
    }

    if(isProd()) {
        await setPropertyOnDoc(doc,'colocadoEv',true)
        await setPropertyOnDoc(doc,'removedFromEv',false)
        await setPropertyOnDoc(doc,'alreadyRemovedFromEv',false)
    }

    log({robot:'cadastrar-livros', log:`Livro cadastrado na EV ${doc.id}`})

    return true
}



// algumas condições setadas nas configurações, pra ignorar o cadastro
function testConditionsToIgnore(doc,config){
    // rodar 'manualmente' num range:  getLivrosColocarEvBetweenIds
    // Modo estável: getLivrosColocarEv
    // tirar essa condição pra cadastrar range manual
    if(!doc[config.propCadastrar]) return true ;

    // valida doc.id
    if(doc.id > config.ignoraIdMaiorQue ) return true ;
    if(doc.id < config.ignoraIdMenorQue ) return true ;

    // valida doc.preco
    if(!doc.precoEv && doc.precoVenda < config.ignoraPrecoMenorQue ) return true ;
    if(doc.precoEv && doc.precoEv < config.ignoraPrecoMenorQue ) return true ;
    if(!doc.precoEv && doc.precoVenda > config.ignoraPrecoMaiorQue ) return true ;
    if(doc.precoEv && doc.precoEv > config.ignoraPrecoMaiorQue ) return true ;

    // valida texto de exclusão
    if(doc.obsEstadoConservacao.includes(config.ignoraSeDescricaoContemTexto)) return true ;

    // espera um tempo após cadastro
    let tempoCadastro = Date.now() - (new Date(doc.dataEntrada))
    if( tempoCadastro/(1000*60*60) < config.afterCadastroWaitHours) return true ;
}


async function startHandler(config){   
    console.log('Buscando livros no banco')

    // rodar 'manualmente' num range:  getLivrosColocarEvBetweenIds
    // Modo estável: getLivrosColocarEv
    // let docs =  await getLivrosColocarEvBetweenIds(1568849,9999999, config.maxItems)
    let docs = await getLivrosColocarEv(config.maxItems)

    log({robot:'cadastrar-livros', log: `Buscado no banco ${docs.length} para cadastro. Muitos devem ser ignorados pelas regras`})

    // docs retornados do banco
    if(!docs) return ;
    log({robot:'cadastrar-livros', log: `Cadastrando batch de ${docs.length} livros.. `})

    let n=0;

    // abre driver em profile específico (config)
    driver({
        'profile': config.chromeProfilePath,
        'headless': config.browserHeadless
    })

    // random order.. caso um trave não vai travar pra sempre
    if(config.shuffleOrder){
        docs.sort( () => .5 - Math.random() );
    }

    // prioriza os que não deram erro previamente
    docs.sort( (a,b) => {
        if(b.errorsCadastro && a.errorsCadastro) return a.errorsCadastro - b.errorsCadastro
        return b.errorsCadastro? -1 : 1 
    })

    // cadastro do batch inteiro
    log({robot:'cadastrar-livros', log: `Iniciando cadastro`})
    for(let doc of docs){
        console.log(`✉️  livro (${++n} / ${docs.length}): ${doc.id} `)     

        // testa se o driver está aberto tentando pegar a url
        try {
            currentUrl()
        } catch (error) {
            console.log('Something went wrong... closing driver')
            closeDriver()
        }

        // testa condições pra ignorar
        // se não precisar ignorar, faz o cadastro do livro com o doc dele
        if (testConditionsToIgnore(doc,config)){
            console.log(' ☠️   Livro nao cadastrado ... Ignorado por causa das regras!')                
        } else {
            let ok = await cadastraDoc(doc)
            if(!ok) console.log(' ☠️   Livro nao cadastrado ... Ocorreu um erro!')    
        }
    }
    log({robot:'cadastrar-livros', log: `Finalizando cadastro`})
}




// configurações default, caso o banco não exista etc
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

// configurações do banco
let configImported = await getConfig()
let config = {...defaultConfig, ...configImported}
config = config.cadastrar


// Roda o handler de cadastro
log({robot:'cadastrar-livros', log: 'Iniciando handler'})
await startHandler(config)
log({robot:'cadastrar-livros', log: 'Finalizando operação'})


