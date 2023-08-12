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

To remove books from EV Simply run
```bash
node run.js
```
### Functionality
It reads a couchDB via Mango Query and looks for books without the property 'removedFromEv'.
Then it opens a browser (it can be in headless mode, hard coded for now) and tries to remove all of those books from EV.


## getting new orders
To scrape the data from the orders, run
(this one's auth is expiring faster, idk why)
```bash
node pega-pedidos.js
```
### Functionality
It reads the orders pages then extracts the buyers info.



# Troubleshooting
If chromium is open, it won't be able to work
so make sure to close it after errors etc
