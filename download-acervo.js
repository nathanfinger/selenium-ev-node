import {sleep, driver, closeDriver, clickOnSelector} from './common.js'
await driver().get('https://livreiro.estantevirtual.com.br/acervo/planilha')
await sleep(5)
await clickOnSelector('.last-import-export-button')
await sleep(60) // espera finalizar download
closeDriver()