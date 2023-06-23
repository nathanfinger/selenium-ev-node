# selenium-ev-remover

## Install
Run
```bash
npm i
```

## Usage

Simply run
```bash
node run.js
```


## Basic Functionality
It reads a couchDB via Mango Query and looks for books without the property 'removedFromEv'.
Then it opens a browser (in headless mode) and tries to remove all of those books from EV.
