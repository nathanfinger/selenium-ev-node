import {getDocLivroById} from './db_livros.js'
import {log} from './common.js'
import { promises as fsPromises } from 'fs';
import * as XLSX from 'xlsx/xlsx.mjs'
import * as fs from 'fs';
XLSX.set_fs(fs);
import { Readable } from 'stream';
XLSX.stream.set_readable(Readable);
import * as cpexcel from 'xlsx/dist/cpexcel.full.mjs';
import path from 'path';
XLSX.set_cptable(cpexcel);

function findDuplicates(arr) {
  const duplicates = [];
  const seen = {};

  for (const item of arr) {
    if (seen[item]) {
      duplicates.push(item);
    } else {
      seen[item] = true;
    }
  }
  return duplicates;
}
function getDir(){
  return '/home/ev/Transferências/'
  // return process.cwd()
}
async function getFile(ext='xlsx'){
  try {
    const directory = getDir()
    const files = (await fsPromises.readdir(directory)).filter(f=>f.includes(ext));
    return path.join(directory,files.reverse()[0])
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}

async function getColumnFromExcel(columnName) {
  const excelFileName = await getFile();
  console.log(`reading file ${excelFileName}`)

  if (!excelFileName) {
    console.log('No Excel file found.');
    return [];
  }

  try {
    const workbook = XLSX.readFile(excelFileName);
    const sheetName = workbook.SheetNames[0]; // Assuming you want the first sheet

    const worksheet = workbook.Sheets[sheetName];
    const columnData = [];

    for (const cellAddress in worksheet) {
      if (cellAddress.startsWith(columnName)) {
        columnData.push(worksheet[cellAddress].v);
      }
    }

    return columnData;
  } catch (err) {
    console.error('Error reading Excel file:', err);
    return [];
  }
}

function startAnaliseDuplicados(){
  console.log(`Procurando itens duplicados`)
  let duplicados = findDuplicates(data)
  if(duplicados.length>0){
    console.log('Livros duplicados no estoque da EV:')
    console.log(duplicados)
    }
    return duplicados
}

async function handleDocLivro(id){
  let doc = await getDocLivroById(id)
  if(!doc.id)
    log({robot:'analise-estoque-ev', log:`${id} -> Livro não encontrado `})
  if(doc.status===4)
    log({robot:'analise-estoque-ev', log:`${id} -> status ${doc.status}`})
  if(!doc.status===4)
    log({robot:'analise-estoque-ev', log:`${id} -> status ${doc.status}`})
}

function startAnaliseLivros(){
  console.log(`Buscando livro por livro no banco... isso deve demorar`)
  for (const i in data) {
    setTimeout(()=>handleDocLivro(data[i]),5*i)
  }
}


// usage
console.log(`Pegando coluna do arquivo de excel`)
let coluna_id = 'AB'
let data = await getColumnFromExcel(coluna_id);
data.shift() // remove header


let duplicados = startAnaliseDuplicados()

startAnaliseLivros()




