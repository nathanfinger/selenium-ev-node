import {evPgVendas, sleep} from "./common.js";
async function openBrowser(){
    await sleep(1)
    await evPgVendas()
}

await openBrowser()