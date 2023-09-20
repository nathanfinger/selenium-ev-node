import axios from "axios";
import {db_livros} from './config.mjs'

const instance = axios.create({
    baseURL: `${db_livros.base_url}:${db_livros.port}`,
    auth: {
        username: db_livros.user,
        password: db_livros.password
    }
});


export async function getDoc(endpoint, requestBody){
    try {
        const response = await instance.get(endpoint, requestBody);
        return response.data.docs;
    } catch (error) {
        console.error(error);
        return []
    }
}

export async function postDocs(endpoint, requestBody){
    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs;
    } catch (error) {
        console.error(error);
        return []
    }
}

export async function setPropertyOnDoc(docData, propertyName, propertyValue, table='livros_amz') {
    const endpoint = `/${table}/${docData._id}`;

    try {
        const response = await instance.get(endpoint);
        const doc = response.data;

        doc[propertyName] = propertyValue;

        await instance.put(endpoint, doc);
        console.log(`Book ${docData.id_livro || docData.id || docData._id} updated successfully with ${propertyName} -> ${propertyValue} `);
    } catch (error) {
        console.error(error);
    }
}


export async function getLivrosWithoutProperty(propertyName, propertyValue=false, table='livros_amz', limit=1) {
    const endpoint = `/${table}/_find`;
    const requestBody = {
        selector: {
            $or: [
                {[propertyName]: {$exists: false}},
                {[propertyName]: {$eq: propertyValue}}
            ]},
        limit: limit
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs;
    } catch (error) {
        console.error(error);
    }
}


export async function getLivrosWithProperty(table='livros_amz', propertyName='status', propertyValue=4, limit=100) {
    const endpoint = `/${table}/_find`;
    const requestBody = {
        selector: {
            [propertyName]: {$eq: propertyValue}
            },
        limit: limit
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs;
    } catch (error) {
        console.error(error);
    }
}


export async function getLivrosDisponiveisWithProperty(propertyName='status', propertyValue=4, limit=999999) {
    const endpoint = `/${'livros_amz'}/_find`;
    const requestBody = {
        selector: {
            $and: [
                {['status']: {$eq: 4}},
                {[propertyName]: {$eq: propertyValue}}
            ]},
        limit: limit
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs;
    } catch (error) {
        console.error(error);
    }
}


export async function getLivrosColocarCapa(limit=999){
    const endpoint = `/${'livros_amz'}/_find`;
    const requestBody = {
        selector: {
            $and: [
                {['status']: {$eq: 4}},
                {['colocarCapaEv']: {$eq: true}},
                {
                    $or: [
                        {['colocadoCapaEv']: {$exists: false}},
                        {['colocadoCapaEv']: {$eq: false}}
                    ]
                }      
            ]},
        limit: limit
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs;
    } catch (error) {
        console.error(error);
    }
}


export async function getLivrosColocarEv(limit=999999) {
    const endpoint = `/${'livros_amz'}/_find`;
    const requestBody = {
        selector: {
            $and: [
                {['status']: {$eq: 4}},
                {['disponibilizarEv']: {$eq: true}},
                {
                    $or: [
                        {['colocadoEv']: {$exists: false}},
                        {['colocadoEv']: {$eq: false}}
                    ]
                }      
            ]},
        limit: limit
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs;
    } catch (error) {
        console.error(error);
    }

}



export async function getLivrosNaoDisponiveisWithProperty(propertyName='status', propertyValue=4, limit=999999) {
    const endpoint = `/${'livros_amz'}/_find`;
    const requestBody = {
        selector: {
            $and: [
                {['status']: {$ne: 4}},
                {[propertyName]: {$eq: propertyValue}}
            ]},
        limit: limit
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs;
    } catch (error) {
        console.error(error);
    }
}

export async function getAttachment(db, docid, attname){
    return await instance.get(`/${db}/${docid}/${attname}`, { responseType: 'arraybuffer' })
}

export async function getCapaById(id){
    console.log(`Buscando capa com ID = ${id}`)
    const endpoint = `/${'livros_amz'}/_find`;
    const requestBody = {
        selector: {
            ['id']: {$eq: id}
        },
        limit: 1
    };
    let docs = await getDoc(endpoint,requestBody)
    console.log(`Registros encontrados = ${docs.length}`)

    if (docs.length === 0) return false
    // TODO confere se capa existe e formato
    // let nome = docs[0]._id+'.jpg'


    // se não existe capa tem que fazer download da capa padrão do 'sem capa'
    if(!docs[0]._attachments){
        let capa = await getAttachment('livros_amz', 0, nome)
        return capa
    }

    let nome = 'capa.jpg'
    console.log(`tentando baixar a capa (${nome}) do doc (${docs[0]._id}) `)
    let capa = await getAttachment('livros_amz', docs[0]._id, nome)
    return capa
}

export async function getCapaByDoc(doc){
    // TODO confere se capa existe e formato
    let nome = 'capa.jpg'
    console.log(`tentando baixar a capa (${nome}) do doc (${doc._id}) `)
    let capa = await getAttachment('livros_amz', doc._id, nome)
    return capa
}


export async function getCapaTeste(id){
    let capa = await getAttachment('test', '9ed784f939332289e1be26fd1c0072e9', '1553351.jpg')
    return capa
}





export async function getLivrosDisponiveisBetweenIds(idMin=1562862, idMax=1568849, limit = 500) {
    const endpoint = `/${'livros_amz'}/_find`;
    const requestBody = {
        selector: {
            $and: [
                {['status']: {$eq: 4}},
                {['id']: {$gt: idMin}},
                {['id']: {$lt: idMax}}
            ]},
        limit: limit
    };

    let x = await postDocs(endpoint, requestBody)
    return x
}


export async function getLivrosColocarEvBetweenIds(idMin=1562862, idMax=1568849, limit = 500) {
    const endpoint = `/${'livros_amz'}/_find`;
    const requestBody = {
        selector: {
            $and: [
                {['status']: {$eq: 4}},
                {['id']: {$gt: idMin}},
                {['id']: {$lt: idMax}},
                {
                    $or: [
                        {['colocadoEv']: {$exists: false}},
                        {['colocadoEv']: {$eq: false}}
                    ]
                }                     
            ]},
        limit: limit
    };

    let x = await postDocs(endpoint, requestBody)
    return x
}



export const saveErroCadastro = async function (doc, errors){
    let errorsCadastro = 0
    if(doc.errorsCadastro) {
        errorsCadastro = doc.errorsCadastro + 1
    } else {
        errorsCadastro = doc.errorsCadastro = 1
    }

    await setPropertyOnDoc(doc, 'cadastroEvErros', errors)
    await setPropertyOnDoc(doc, 'errorsCadastro', errorsCadastro)

    await updateOrSaveDoc(doc, table)
}