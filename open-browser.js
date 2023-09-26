import { Builder} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js'

async function open(profile){
    // profile dir
    const options = new chrome.Options();
    options.addArguments('--user-data-dir='+profile);

    // instancing driver with options
    let _driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    return _driver;
}

let url = 'https://www.estantevirtual.com.br/acervo'
async function openBrowser1(){
    let d = await open('./profiles/chrome1')
    d.get(url)
}
async function openBrowser2(){
    let d = await open('./profiles/chrome2')
    d.get(url)
}


openBrowser1()
openBrowser2()