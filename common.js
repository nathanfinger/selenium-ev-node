import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js'


let _driver = null;
let profileDirectory='./profiles/chrome1'

export const driver = () => {
    const options = new chrome.Options();
    options.addArguments('--user-data-dir='+profileDirectory);
    // options.addArguments('--headless');

    if(_driver) return _driver;
    console.log(`Driver does not exist.. instancing new driver ...`)
    _driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    return _driver;
}


const js_utils = `
    window.sel = (selector) => {
        return document.querySelector(selector)
    }
    window.setval = (selector, value) => {
        sel(selector).value = value;
    }
    window.click = (selector) => {
        sel(selector).click()
    }
`;

export const exec = async(js,...args) => {
    return await driver().executeScript(js_utils + "\n" + js, ...args);
}


export const waitFor = async(selector) => {
    return await waitUntilScript(`return document.querySelector("${selector}");`);
}

export const waitUntilScript = async(script) => {
    return await driver().wait(
        async () => await exec(script),
        20000,
        `Timeout while waiting for: ${script}`
    );
}
export const waitUntilEnabled = async(selector) => {
    return await driver().wait(until.elementIsEnabled(By.css(selector)), 10000)
}


export const waitAlert = async() => {
    return await driver().wait(until.alertIsPresent(), 10000)
}


export const get = async(url) => {
    let r = await driver().get(url)

    // test for 'errors'
    if((await driver().getCurrentUrl()).includes('login')){
        console.log('The Browser is probably asking for login credentials')
    }
    return r
}

export const sleep = async(seconds) => {
    console.log(`Sleeping for ${seconds} seconds`)
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, seconds * 1000)
    });
}

export const clickOnSelector = async(selector) =>{
    console.log(`Waiting to click on: ${selector}`);
    (await waitFor(selector)).click()
    console.log(`Clicked on: ${selector}`);
}


export const sendKeysToInput = async (selector, keys) => {
    try {
        console.log(`Sending Keys '${keys}' to input`);
        const inputElement = await waitFor(selector);
        await inputElement.sendKeys(keys);
    } catch (error) {
        console.error('An error occurred while sending keys to input:', error);
    }
};

export const acceptAlert = async () => {
    await sleep(1);
    try {
        console.log(`Accepting alert`);
        await waitAlert();
        const alert = await driver().switchTo().alert();
        await alert.accept();
        return true;
    } catch (e) {
        console.log(`Expected alert not found`);
        return false;
    }
};

export const closeDriver = async () =>{
    console.log(`Closing driver`);
    driver().close()
}

export const countElements = async(selector) =>{
    try {
        const elements = await driver().findElements(By.css(selector));
        return elements.length;
    } catch (error) {
        console.error('An error occurred while counting elements:', error);
        return 0;
    }
}

export const getElements = async(selector) =>{
    try {
        return (await driver().findElements(By.css(selector)));
    } catch (error) {
        console.error('An error occurred while getting elements:', error);
        return [];
    }
}

export const getProperties = async (selector, prop = 'innerHTML') => {
    try {
        const elements = await driver().findElements(By.css(selector));
        const propertyValues = await Promise.all(
            elements.map(async (element) => await element.getProperty(prop))
        );
        return propertyValues.map((value) => value.toString());
    } catch (error) {
        console.error('An error occurred while getting property:', error);
        return [];
    }
};


// Estante virtual
export const evBuscaById = async(idSearch) =>{
    console.log(`Searching for ID: ${idSearch}`);
    let urlBusca = 'https://www.estantevirtual.com.br/acervo?sub=listar&ativos=0&alvo=descr&pchave='+idSearch
    await get(urlBusca)
}

export const idFromText = text=>{
    return text.match(/ID \d+/g)[0].replace('ID ','')
}

export const evPgPedido = async(idPedidoEv) =>{
    console.log(`Getting order page: ${idPedidoEv}`);
    const urlPedidoEv = 'https://livreiro.estantevirtual.com.br/v2/vendas/'+idPedidoEv
    await get(urlPedidoEv)
}

export const evPgCadastro = async() =>{
    const url = 'https://www.estantevirtual.com.br/acervo/editar'
    await get(url)
}
export const evPgVendas = async() =>{
    console.log(`Getting sales page: ${''}`);
    const urlVendas = 'https://livreiro.estantevirtual.com.br/vendas/?termo=&periodo=total&status=standby&forma_pagamento=todas&carrier=&envio=&rows_per_page=100'
    await get(urlVendas)
}


export const evPegaInfosPedido = async(idPedidoEv) => {
    await evPgPedido(''+idPedidoEv)

    const data = new Date()
    const pedido = ''+idPedidoEv
    const qtde = await countElements('.sale-details__summary-product-title')
    const descricoes_livros = (await getProperties('.order-sale__data-description-text','innerHTML'))
    const ids_livros = descricoes_livros.map(idFromText)
    const shippingInfo = (await getProperties('.shipping-info','innerHTML'))[0]
    const frete = (await getProperties('.sale-details__summary-freight > .col-xs-3','innerHTML'))[0].match(/\d+[,]?\d+/)[0].replace(',','.')
    const subtotal = (await getProperties('.sale-details__summary-subtotal > .col-xs-3','innerHTML'))[0].match(/\d+[,]?\d+/)[0].replace(',','.')
    const total = (await getProperties('.sale-details__summary-total > .col-xs-3','innerHTML'))[0].match(/\d+[,]?\d+/)[0].replace(',','.')
    const endereco = shippingInfo.split('</p>')[2].replaceAll('\n','').replaceAll('<p>','').replaceAll('  ','')
    const nome = (await getProperties('.user-info__buyer','innerHTML'))[0]
    const userInfo = (await getProperties('.user-info','innerHTML'))[0]
    const cpf = userInfo.split('CPF: ')[1].split(' ')[0]
    const envio = (await getProperties('.shipping-type-info span','innerHTML'))[0].match(/\w+/)[0]

    // ... mais alguma coisa??

    return {ids_livros, qtde, cpf, nome, frete, endereco, envio, pedido, subtotal, total, data}
}


export const evListaPedidos = async function(){
    return  (await getProperties('.order','innerHTML')).map(e=>e.match(/\d+/)[0])

}


export const evSetTrackingCode = async function (code) {
    sendKeysToInput('#tracking_code',code)
    // clickOnSelector('#tracking_code_btn')
}


export const currentUrl = async function(){
    return await driver().getCurrentUrl()
}




