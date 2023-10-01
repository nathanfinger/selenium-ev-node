import axios from "axios";
import {db_livros} from './config.mjs'

export const instance = axios.create({
    baseURL: `${db_livros.base_url}:${db_livros.port}`,
    auth: {
        username: db_livros.user,
        password: db_livros.password
    }
});


export async function saveDoc(data, table) {
    const endpoint = `/${table}`;
    try {
        const response = await instance.post(endpoint, data);
        console.log('Document saved successfully:', response.data);
    } catch (error) {
        console.error('An error occurred while saving the document:', error);
    }
}

export async function updateOrSaveDoc(data, table='livros_amz',prop='id',value='') {
    value = value ? value : data.id
    const endpoint = `/${table}/_find`;
    const requestBody = {
        selector: {
            [prop]: value,
        },
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        const existingDoc = response.data.docs[0];

        if (existingDoc) {
            // Document with matching id found, update it with additional data
            const updatedDoc = { ...existingDoc, ...data };
            await saveDoc(updatedDoc, table);
            console.log('Document updated successfully:', updatedDoc);
        } else {
            // Document with matching id not found, save a new document
            await saveDoc(data, table);
            console.log('New document saved successfully:', data);
        }
    } catch (error) {
        console.error('An error occurred while updating or saving the document:', error);
    }
}

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
        console.error('error on postDocs: ', error);
        return []
    }
}

export async function setPropertyOnDoc(docData, propertyName, propertyValue, table='livros_amz') {
    const endpoint = `/${table}/${docData._id}`;

    try {
        const response = await instance.get(endpoint);
        const doc = response.data;

        if(typeof(propertyName)==='string') {
            doc[propertyName] = propertyValue 
        } else {
            propertyName.forEach((e,i)=>{doc[propertyName[i]] = propertyValue[i]})
        }
        

        await instance.put(endpoint, doc);
        console.log(` ✔️  Book ${docData.id_livro || docData.id || docData._id} updated successfully with ${propertyName} -> ${propertyValue} `);
    } catch (error) {
        console.error('error on setPropertyOnDoc: ', error);
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


export async function getLivrosColocarEv_v1(limit=999) {
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

    // se não existe capa tem que fazer download da capa padrão do 'sem capa'
    if(!docs[0]._attachments){
        let capa = await getAttachment('livros_amz', 0, nome)
        return capa
    }

    let nome = 'capa.jpg'
    console.log(` ⬇️ Baixando capa padrão (${nome}) do Banco... `)
    let capa = await getAttachment('livros_amz', docs[0]._id, nome)
    return capa
}

export async function getCapaByDoc(doc){
    // TODO confere se capa existe e formato
    let nome = 'capa.jpg'
    console.log(` ⬇️ Baixando a capa (${nome}) do Banco... `)
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

    await setPropertyOnDoc(doc, ['cadastroEvErros','errorsCadastro'], [errors,errorsCadastro])
}




export async function getFromLivrosView(limit = 200, databaseName='livros_amz', designDocumentName='cadastrosEv', livros_view = 'a-retirar-ev', sortField='id', sortType='asc') {
    let endpoint = `/${databaseName}/_design/${designDocumentName}/_view/${livros_view}`;
      const queryParameters = {
      limit: limit,
      include_docs: true,
      sort: [
        {[sortField]: sortType},
    ]
    };
   
    try {
        const response = await instance.get(endpoint, { params: queryParameters });
        return response.data.rows.map(row => row.doc);
      } catch (error) {
        console.error(error);
        return [];
      }

  }
  


  export async function getLivrosColocarEv(limit=999) {
    return await getFromLivrosView(limit, 'livros_amz', 'cadastrosEv', 'a-colocar-ev', 'id', 'asc')
    }





export async function getDocLivroById(id) {
    const endpoint = `/livros_amz/${''+id}`
    try {
        let doc = await instance.get(endpoint)
        return doc.data
    } catch (error) {
    //   console.error('Error retrieving document:', error);
      return {}
    }
  }