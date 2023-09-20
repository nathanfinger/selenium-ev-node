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
    port: "1234",
    user: "myuser",
    password: "mypass"
};
```

## Cadastra livros na EV:

```bash
node cadastrar-livros.js
```

### Funcionamento
A partir das funções de db_livros.js, vai pegar os livros a serem cadastrados. 
Vai buscar livros com disponibilizarEv:true
Vai ignorar livros com colocadoEv:true

Algumas opções estão sendo carregadas do próprio banco, em config-robots-ev.
As propriedades para cadastrar têm alias com 'Ev' n final.
i.e.
```js
let isbn = doc.isbnEv || doc.isbn || ''
let estante = doc.assuntoEv || doc.assunto
let autor = doc.autorEv || doc.autor
let titulo = doc.tituloEv || doc.titulo
let editora = doc.editoraEv || doc.editora
let ano = doc.anoEdicaoEv || doc.anoEdicao
let preco = doc.precoEv || doc.precoVenda
let peso = doc.pesoEv || doc.peso
let descricao = doc.obsEstadoConservacao
```

Os inputs são mapeados pelo dicionário 'evSelectors', é possível que precisem ser autalizados.
```js
const evSelectors = {
    error: '.error',
    isbn: '#form_isbn',
    barcode: '#form_barcode',
    estante: '#form_estante',
    idioma: '#form_idioma',
    autor: '#form_autor',
    titulo: '#form_titulo',
    editora: '#form_editora',
    ano: '#form_ano',
    edition: '#form_edition',
    preco: '#form_preco',
    peso: '#form_peso',
    descricao: '#form_descricao',
    category: '#form_category',
    location_in_store: '#form_location_in_store',
}
```



## removing books
Pra remover os livros rodar 
```bash
node run.js
```

### Funcionamento
Lê do banco via funções do db.js e db_livros.js os livros a serem removidos da EV
1) Vai procurar por docs/livros fora do status disponível (4) com 'colocadoEv'
1.1) Vai ignorar os docs/livros com a propriedade [propRemovido] (removedFromEv by default)
2) Vai procurar sem removedFromEv, que já passaram pelo checkout
Após remover o robô coloca uma propriedade 'removedFromEv' : true
Após tentar remover livro removido o robô coloca uma propriedade 'alreadyRemovedFromEv' : true
Se removido, vai alterar 'colocadoEv' pra false.

Para alterar os livros a serem retirados:
Para status geral: ver 'getLivrosNaoDisponiveisWithProperty'
Os que passaram pelo checkout: 'getLivroWithoutProperty'


## Colocando rastreio
Pra colocar o rastreio, rodar
```bash
node coloca-rastreio.js
```

### Funcionamento
Vai procurar no banco (ver db.js) pedidos com rastreio já definido e colocar na EV



## getting new orders
To scrape the data from the orders, run
```bash
node pega-pedidos.js
```
### Functionality
It reads the orders pages then extracts the buyers info.
It only updates the orders that have a new status code.


# Troubleshooting
1) Os Scripts devem estar usando o mesmo perfil de chrome, então não podem rodar ao mesmo tempo
Por quê? pra não precisar ficar logando e resolvendo centenas de captchas em vários perfis
Dava pra expoertar cookies de outro navegador, mas não consegui importar pro selenium, tem espaço pra melhora.

2) Ao ocorrer um erro inesperado, o script pode crashar e esquecer de fechar o chrome, o que vai impedir as próximas execuções (vide item 1)
Acho que se abrir o selenium como subprocesso resolve.


