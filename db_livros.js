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

export async function setPropertyOnDoc(docData, propertyName, propertyValue, table='livros_ativos') {
    const endpoint = `/${table}/${docData._id}`;

    try {
        const response = await instance.get(endpoint);
        const doc = response.data;

        doc[propertyName] = propertyValue;

        await instance.put(endpoint, doc);
        console.log(`Book ${docData.id_livro || docData.id || docData._id} updated successfully.`);
    } catch (error) {
        console.error(error);
    }
}


export async function getLivrosWithoutProperty(propertyName, propertyValue=false, table='livros_ativos', limit=1) {
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


export async function getLivrosWithProperty(table='livros_ativos', propertyName='status', propertyValue=4, limit=100) {
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
    const endpoint = `/${'livros_ativos'}/_find`;
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

export async function getLivrosColocarEv(limit=999999) {
    const endpoint = `/${'livros_ativos'}/_find`;
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
    const endpoint = `/${'livros_ativos'}/_find`;
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

export async function getCapaById(traca_id){
    const endpoint = `/${'livros_ativos'}/_find`;
    const requestBody = {
        selector: {
            ['id']: {$eq: traca_id}
        },
        limit: 1
    };
    let docs = await getDoc(endpoint,requestBody)
    if (docs.length === 0) return false
    // TODO confere se capa existe e formato

    let nome = docs[0]._id+'.jpg'
    let capa = await getAttachment('livros_ativos', docs[0]._id, nome)
    return capa
}

export async function getCapaTeste(traca_id){
    let capa = await getAttachment('test', '9ed784f939332289e1be26fd1c0072e9', '1553351.jpg')
    return capa
}
