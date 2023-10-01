import {sleep, driver, closeDriver} from './common.js'
await driver().get('https://livreiro.estantevirtual.com.br/acervo/export_request')
await sleep(15)
await closeDriver()