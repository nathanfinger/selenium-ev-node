import { Builder, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js'


let _driver = null;
let profileDirectory='./profiles/chrome1'

export const driver = () => {
    const options = new chrome.Options();
    options.addArguments('--user-data-dir='+profileDirectory);
    options.addArguments('--headless');

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
    return await driver().get(url)
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




// Estante virtual
export const evBuscaById = async(idSearch) =>{
    console.log(`Searching for ID: ${idSearch}`);
    let urlBusca = 'https://www.estantevirtual.com.br/acervo?sub=listar&ativos=0&alvo=descr&pchave='+idSearch
    await get(urlBusca)
}





