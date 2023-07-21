import {options, closeDriver, currentUrl, evPgVendas, sleep, driver, get} from "./common.js";

let cookies = [
    {
        domain: '.livreiro.estantevirtual.com.br',
        expiry: 1724436400,
        httpOnly: false,
        name: '_ga_FWQG4ZMNL4',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'GS1.4.1689876368.1.1.1689876400.28.0.0'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1705428400,
        httpOnly: false,
        name: '__uzmdj3',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '1689876400'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1689878200,
        httpOnly: false,
        name: '_hjAbsoluteSessionInProgress',
        path: '/',
        sameSite: 'None',
        secure: true,
        value: '0'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1690481200,
        httpOnly: false,
        name: 'oppuz_last_page',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'https%3A%2F%2Flivreiro.estantevirtual.com.br%2Fvendas%3Fcarrier%3D%26envio%3D%26forma_pagamento%3Dtodas%26periodo%3Dtotal%26rows_per_page%3D100%26status%3Dstandby%26termo%3D'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1689962799,
        httpOnly: false,
        name: '_gid',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'GA1.3.1431763037.1689876296'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1690481200,
        httpOnly: false,
        name: 'oppuz_session',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '64b9774b6f6d6e0d4e000014'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1705428400,
        httpOnly: false,
        name: '__uzmcj3',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '487762292861'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1723572297,
        httpOnly: false,
        name: '_tt_enable_cookie',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '1'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1721412297,
        httpOnly: false,
        name: '_clck',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '1ehz3yq|2|fdg|0|1296'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1705428400,
        httpOnly: false,
        name: '__ssds',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '3'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1724436336,
        httpOnly: false,
        name: 'cookie_accept_policy',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'true'
    },
    {
        domain: '.livreiro.estantevirtual.com.br',
        expiry: 1724436399,
        httpOnly: false,
        name: '_ga',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'GA1.4.1029429893.1689876296'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1689876520,
        httpOnly: false,
        name: '_hjIncludedInSessionSample_132132',
        path: '/',
        sameSite: 'None',
        secure: true,
        value: '0'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1697652295,
        httpOnly: false,
        name: '_gcl_au',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '1.1.1727812591.1689876296'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1721412400,
        httpOnly: false,
        name: '_hjMinimizedPolls',
        path: '/',
        sameSite: 'None',
        secure: true,
        value: '837392'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1705428400,
        httpOnly: false,
        name: '__uzmbj3',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '1689876296'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1697652400,
        httpOnly: false,
        name: '_fbp',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'fb.2.1689876296582.1265723475'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1689878200,
        httpOnly: false,
        name: '_hjSession_132132',
        path: '/',
        sameSite: 'None',
        secure: true,
        value: 'eyJpZCI6Ijc1Y2ZkNDgzLWIzMWQtNGNjNi04Y2NlLWVhM2M2ZTg3YTg4OCIsImNyZWF0ZWQiOjE2ODk4NzYyOTY1NDcsImluU2FtcGxlIjpmYWxzZX0='
    },
    {
        domain: '.estantevirtual.com.br',
        httpOnly: true,
        name: '_session_id',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '1b6ae43cd63a8ef76023397f67a2d9ff'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1705428400,
        httpOnly: false,
        name: '__uzmaj3',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'b921372b-7c24-45ee-a264-d74b3b746256'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1705428400,
        httpOnly: false,
        name: '__ssuzjsr3',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'a9be0cd8e'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1689876428,
        httpOnly: false,
        name: '_gat',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '1'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1723572297,
        httpOnly: false,
        name: '_ttp',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '1btv56fLLBM05gamoyXDikqbiMl'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1724436399,
        httpOnly: false,
        name: '_ga',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'GA1.3.1029429893.1689876296'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1724436298,
        httpOnly: false,
        name: '__bid',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'd3fd1d4b-68e4-4818-861e-da06594ba62d'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1721412400,
        httpOnly: false,
        name: '_hjSessionUser_132132',
        path: '/',
        sameSite: 'None',
        secure: true,
        value: 'eyJpZCI6IjhmZWRlOTU0LWQyMGItNWQ0Yy04NGUxLTIyNGRjOWQxYmE3NiIsImNyZWF0ZWQiOjE2ODk4NzYyOTY1MzEsImV4aXN0aW5nIjp0cnVlfQ=='
    },
    {
        domain: '.livreiro.estantevirtual.com.br',
        expiry: 1689962799,
        httpOnly: false,
        name: '_gid',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'GA1.4.1431763037.1689876296'
    },
    {
        domain: '.livreiro.estantevirtual.com.br',
        expiry: 1689876428,
        httpOnly: false,
        name: '_gat_UA-2185116-5',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '1'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1689878163,
        httpOnly: false,
        name: '_hjFirstSeen',
        path: '/',
        sameSite: 'None',
        secure: true,
        value: '1'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1689962771,
        httpOnly: false,
        name: '_clsk',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: '1k7riym|1689876371107|4|1|r.clarity.ms/collect'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1689962800,
        httpOnly: false,
        name: '_uetsid',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'ef02a8f0272711ee8eafad978f842205'
    },
    {
        domain: '.estantevirtual.com.br',
        expiry: 1723572400,
        httpOnly: false,
        name: '_uetvid',
        path: '/',
        sameSite: 'Lax',
        secure: false,
        value: 'ef038a80272711ee8ab5d5f6a21448da'
    }
]


async function testSession(){
    await sleep(1)
    await evPgVendas()
    while ((await currentUrl()).includes('login')){
        console.log('Browser is asking for login')
        await sleep(30)
        await evPgVendas()
    }
    console.log('OK')
    await sleep(30)
    closeDriver()
}





async function showCookies() {
    (await driver()).manage().getCookies().then(function (cookies) {
        console.log('cookie details => ', cookies);
    })
}

async function addCookies(cookies) {
    for (let c in cookies){
        await (await driver()).manage().addCookie({...cookies[c], domain:'.estantevirtual.com.br'})
    }
    await sleep(3)
}







options.addArguments('--user-data-dir=./pro files/chrometest');


await evPgVendas()
await sleep(4)
await get('https://www.estantevirtual.com.br')
await sleep(5)
await addCookies(cookies)
await sleep(15)
await evPgVendas()

// await testSession()




