import {getFromLivrosView} from './db_livros.js'


let docs = await getFromLivrosView(50)
console.log(docs.length)

