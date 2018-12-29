'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

app.get('/', home);
app.post('/searches', search);

function home(request, response){
  response.render('pages/index');
}

function search(request, response){
  let query = request.body.search[0];
  let searchType = request.body.search[1];
  let URL = `https://www.googleapis.com/books/v1/volumes?q=`;

  if(searchType === 'title'){
    URL += `+intitle:${query}`;
  } else if(searchType === 'author'){
    URL += `+inauthor:${query}`;
  }

  return superagent.get(URL)
    .then( result => {
      let books = result.body.items.map(book =>  new Book(book));
      response.render('pages/show', {books});
    })
    .catch(err => response.render('pages/error', {err}));
}

app.listen(PORT, () => console.log(`APP is up on Port: ${PORT}`));

//=============
// Constructors
//=============

const Book = function(data) {
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors.reduce((accum, auth) => {
    accum += auth + ' ';
    return accum;
  }, '');
  this.description = data.volumeInfo.description;
  this.image_url = data.volumeInfo.imageLinks.thumbnail;
  this.isbn = `${data.volumeInfo.industryIdentifiers[0].type} ${data.volumeInfo.industryIdentifiers[0].identifier}`; 
}