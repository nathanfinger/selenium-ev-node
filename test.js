import {getDocLivroById} from './db_livros.js'





//   const endpoint = `/livros_amz/1240607`

let x = await getDocLivroById(1240607)
console.log(x)