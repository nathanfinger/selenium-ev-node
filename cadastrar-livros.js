import {evPgCadastro, sendKeysToInput} from "./common.js";

const cadastrar = async (livro,pathImg) => {
    await evPgCadastro()
    let ids = {
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
    // await sendKeysToInput('#form_capa','/home/nathan/traca/imgs/1162398.jpg')
    // let data = getDataFromDb()
    // await sendKeysToInput(ids[key],data[key])

}


