import axios from "axios";
import {db} from './config.mjs'

const instance = axios.create({
    baseURL: `${db.base_url}:${db.port}`,
    auth: {
        username: db.user,
        password: db.password
    }
});



export async function getLivroWithoutProperty(propertyName, propertyValue=false) {
    const endpoint = "/local_mysql_expedicao/_find";
    const requestBody = {
        selector: {
            $or: [
                {[propertyName]: {$exists: false}},
                {[propertyName]: {$eq: propertyValue}}
            ]},
        limit: 1
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs;
    } catch (error) {
        console.error(error);
    }
}

export async function setPropertyOnDoc(docData, propertyName, propertyValue, table='local_mysql_expedicao') {
    const endpoint = `/${table}/${docData._id}`;

    try {
        const response = await instance.get(endpoint);
        const doc = response.data;

        doc[propertyName] = propertyValue;

        await instance.put(endpoint, doc);
        console.log(`Book ${docData.id_livro} updated successfully.`);
    } catch (error) {
        console.error(error);
    }
}


export async function countLivrosWithoutProperty(propertyName, propertyValue = false) {
    const endpoint = "/local_mysql_expedicao/_find";
    const requestBody = {
        selector: {
            $or: [
                { [propertyName]: { $exists: false } },
                { [propertyName]: { $eq: propertyValue } }
            ]
        },
        fields: ["_id"],
        limit: 1000
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs.length;
    } catch (error) {
        console.error(error);
        return 0; // Return 0 if an error occurs
    }
}

export async function saveDoc(data, table) {
    const endpoint = `/${table}`;
    try {
        const response = await instance.post(endpoint, data);
        console.log('Document saved successfully:', response.data);
    } catch (error) {
        console.error('An error occurred while saving the document:', error);
    }
}

export async function updateOrSaveDoc(data, table,prop='id',value='') {
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


export async function getTableDocWithProperty(table='pedidos', propertyName, propertyValue=true) {
    const endpoint = `/${table}/_find`;
    const requestBody = {
        selector: {
            [propertyName]: {$eq: propertyValue}
        },
        limit: 1
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs;
    } catch (error) {
        console.error(error);
    }
}


export async function test(){
    let book = await getLivroWithoutProperty('removedFromEv',false)
    console.log(book)
}



export async function getConfig(){
    const endpoint = `/robots-config/_find`;
    const requestBody = {
        selector: {
            "_id": {$eq: "config-robots-ev"}
        },
        limit: 1
    };

    try {
        const response = await instance.post(endpoint, requestBody);
        return response.data.docs[0];
    } catch (error) {
        console.error(error);
    }

}
