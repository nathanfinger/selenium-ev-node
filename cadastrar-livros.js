import {clickOnSelector, evPgCadastro, sendKeysToInput, sleep} from "./common.js";
import {getCapaTeste, getDoc, getLivrosDisponiveisWithProperty, setPropertyOnDoc as l_setPropertyOnDoc} from "./db_livros.js";
import {resolve} from 'path'
import fs from 'fs'
import { setPropertyOnDoc } from "./db.js";



function docTest(){
    return {
        "_id": "9ed784f939332289e1be26fd1c0072e9",
        "_rev": "4-3172ed5e4dea9847ce77aee0ced02afe",
        "id": 1539820,
        "colecao": "",
        "volume": null,
        "titulo": "Quem De Nós",
        "subtitulo": "",
        "tituloOriginal": "",
        "autor": "Mario Benedetti",
        "tradutor": "",
        "editora": "Mercado Aberto",
        "numeroEdicao": "0",
        "anoEdicao": "1992",
        "isbn": "9788528002188",
        "isbn13": null,
        "idLingua": 1,
        "tipoItem": 1,
        "curioso": null,
        "autografado": 0,
        "precoCompra": null,
        "escaninho_loja": 0,
        "precoVenda": 39.900001525878906,
        "precoAntigo": null,
        "dataAtPreco": "2023-04-03T20:18:36.000Z",
        "precoEditora": null,
        "idEncadernacao": 1,
        "numeroPaginas": 88,
        "medidas": "14x20",
        "peso": 112,
        "localizacao": "9830",
        "escaninho": null,
        "ilustrado": 0,
        "ilustrador": "",
        "obsIlustracao": "",
        "assunto": "Literatura Estrangeira. Literatura e Arte. Ficção. Romance. Século XX. Clássicos. Literatura uruguaia.",
        "assunto_tmp": null,
        "assuntoFiltrado": null,
        "prefacioPosfacio": "",
        "observacoes": "",
        "antologia": null,
        "idConservacao": 3,
        "obsEstadoConservacao": "Regular. Pode apresentar lombada e capas com desgastes nas bordas e/ou sinais de usos. Páginas e cortes amareladas e marcas de oxidação do papel. Pode apresentar grifos, marcações de caneta e lápis, ou anotações nas páginas e capas.",
        "dataEntrada": "2023-04-03T20:17:54.000Z",
        "dataHora": null,
        "idUserEdit": null,
        "status": 4,
        "anoPrimeiraEdicao": "",
        "links": null,
        "loteCompra": null,
        "idLingua2": 0,
        "idLingua3": 0,
        "idLingua4": 0,
        "idLingua5": 0,
        "linguaOLD": null,
        "resenha": "",
        "corLombada": "Cinza,Branco",
        "larguraLombada": 0.5,
        "critica": null,
        "classeOriginal": null,
        "idEditora": 552,
        "urlCaptura": null,
        "etiquetado": null,
        "quantidade": null,
        "novoImperfeito": null,
        "importado": null,
        "idOrigem": null,
        "idArquivo": null,
        "dataEnderecado": null,
        "disponibilidade": null,
        "statusEtiqueta": null,
        "idUserCad": 485,
        "tipoImpressao": null,
        "idClone": null,
        "lombadaEspecial": "N",
        "lancamento": 0,
        "dataLiberacao": null,
        "tituloRewrite": null,
        "percentualDesconto": 0,
        "qualificacaoCadastro": null,
        "relevante": null,
        "canonico": null,
        "statusGoogle": null,
        "livroPrincipal": null,
        "idCanonico": null,
        "tipoPreco": 1,
        "local": null,
        "feiradolivro": "N",
        "capa": null,
        "inPromotion": 0,
        "idGrupoCanonico": null,
        "_attachments": {
            "1553351.jpg": {
                "content_type": "image/jpeg",
                "revpos": 2,
                "digest": "md5-YhyaS94h4+5P4eHbKP+iWg==",
                "length": 93732,
                "stub": true
            }
        }
    }
}






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

    let isbn = doc.isbnEv || doc.isbn
    let estante = doc.assuntoEv || doc.assunto
    let autor = doc.autorEv || doc.autor
    let titulo = doc.tituloEv || doc.titulo
    let editora = doc.editoraEv || doc.editora
    let ano = doc.anoEdicaoEv || doc.anoEdicao
    let preco = doc.precoEv || doc.precoVenda
    let peso = doc.pesoEv || doc.peso
    let descricao = `ID ${doc.id}. ${doc.obsEstadoConservacao}`
    let capa = pathImg || ''

    estante = estante.split('.')[0]
    editora = editora.replace('Editora ','').replace('editora ','')


    await sendKeysToInput('#form_isbn', isbn)
    await sendKeysToInput('#form_capa', capa)
    await sendKeysToInput('#form_estante', estante)
    await sendKeysToInput('#form_autor', autor)
    await sendKeysToInput('#form_autor', autor)
    await sendKeysToInput('#form_ano', ano)
    await sendKeysToInput('#form_titulo', titulo)
    await sendKeysToInput('#form_editora', editora)
    await sendKeysToInput('#form_preco', preco)
    await sendKeysToInput('#form_descricao', descricao)
    await sendKeysToInput('#form_peso', peso)

    // await clickOnSelector('.btn-add-acervo')
}



async function downloadCapa(id_traca, path='./img_cadastro.jpg'){
    let capa = await getCapaTeste();
    // let capa = await getCapaById(id_traca);
    
    await fs.promises.writeFile(path, capa.data);
    console.log('File saved successfully:', path);
}




async function cadastraDoc(doc){
    let path = './img_cadastro.jpg';
    path = resolve(path)

    try {
        await downloadCapa(0,path);        
        await sleep(2)
        await evPgCadastro()
        await sleep(2)
        await preencheForm(doc, path)
        await sleep(2)    
    } catch (error) {
        console.log('erro no cadastro do livro')
        console.log(error)
        return false
    }

    await l_setPropertyOnDoc(doc,'colocadoEv',true)
}



async function startHandler(){
    // let docs = await getLivrosColocarEv(10)
    let docs = [docTest()]

    console.log(`Cadastrando batch de ${docs.length} livros.. `)     
    let n=0;
    for(let doc of docs){
        console.log(`livro (${++n}): ${doc.id} `)     
        let ok = await cadastraDoc(doc)
        if(!ok) console.log('Livro nao cadastrado ... Ocorreu um erro!')
    }
}

await startHandler()
