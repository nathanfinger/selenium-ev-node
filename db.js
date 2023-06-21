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

export async function setPropertyOnDoc(docData, propertyName, propertyValue) {
    const endpoint = `/local_mysql_expedicao/${docData._id}`;

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



export async function test(){
    let book = await getLivroWithoutProperty('removedFromEv',false)
    console.log(book)
}
