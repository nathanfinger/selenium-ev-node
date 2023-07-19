# selenium-ev-remover

## Install
Run
```bash
npm i
```


## DB config (CouchDB)
Create a file 'config.mjs' with the credentials following this example:

```js
export const db = {
base_url: "https://my.db.com",
port: "36984",
user: "myuser",
password: "mypass"
};
```
## removing books

To remove the items Simply run
```bash
node run.js
```

To scrape the data drom the orders, run
(this one's auth is expiring fast, idk why)
```bash
node pega-pedidos.js
```

## Basic Functionality
It reads a couchDB via Mango Query and looks for books without the property 'removedFromEv'.
Then it opens a browser (it can be in headless mode, hard coded for now) and tries to remove all of those books from EV.


## Scraping orders data
To scrape the data drom the orders, run
(this one's auth is expiring fast, idk why)
```bash
node pega-pedidos.js
```

## Basic Functionality
It reads the orders pages then extracts the buyers info.
