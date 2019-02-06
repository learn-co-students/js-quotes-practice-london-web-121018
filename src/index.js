const quoteLi = document.querySelector('#quote-list');
const newQuoteForm = document.querySelector('#new-quote-form')

// state
const state = {
  quotes: [],
  selectedQuote: null,
  sorted: true
}

// add quote to page
function addQuote (quote) {
	const quoteEl = document.createElement('li')
  quoteEl.className = 'quote-card'
  quoteEl.dataset.id = quote.id
	quoteEl.innerHTML = `
  <blockquote class="blockquote">
    <p class="mb-0">${quote.quote}</p>
    <footer class="blockquote-footer">${quote.author}</footer>
    <br>
    <button data-id='${quote.id}' class='btn-success'>Likes: <span>${quote.likes}</span></button>
    <button data-id='${quote.id}' class="btn-warning">Edit</button>
    <button data-id='${quote.id}' class='btn-danger'>Delete</button>
  </blockquote>
  `
  const deleteBtn = quoteEl.querySelector('.btn-danger')
  deleteBtn.addEventListener('click', () => {
    state.selectedQuote = quote;
    quoteEl.remove();
    deleteQuote(deleteBtn);
    removeQuote()
  })

  const likeBtn = quoteEl.querySelector('.btn-success')
  likeBtn.addEventListener('click', () => {
    likeQuote(likeBtn);
  })
	quoteLi.append(quoteEl)
}

// add quotes to page
function addQuotes(quotes) {
  quoteLi.innerHTML = '';
  if(!state.sorted){
     sortByAuthor().forEach(addQuote);
   } else {
     state.quotes.forEach(addQuote);
   }
}

// delete quote from state
function deleteQuote(el) {
  quoteId = parseInt(el.dataset.id)
  newQuotesArray = state.quotes.filter( quote => quote.id !== quoteId )
  state.quotes = newQuotesArray
}

// like quote
function likeQuote(el) {
  quoteId = parseInt(el.dataset.id);
  state.selectedQuote = state.quotes.filter( quote => quote.id === quoteId )[0];
  state.selectedQuote.likes += 1;
  updateQuote()
    .then(fetchAndRender)
}

// add event listener to submit button
function addEventListenerToSubBtn(){
  document.addEventListener('click', event => {
    event.preventDefault();
    if(event.target.className === "btn btn-primary"){
      const newQuote = {
        "quote": newQuoteForm['new-quote'].value,
        "likes": 0,
        "author": newQuoteForm.author.value
      }
      state.quotes.push(newQuote);
      newQuoteForm.reset();
      addQuote(newQuote);
      postQuote(newQuote);
    }
  })
}

// -----------------------  Server stuff  -------------------------------
// get all quotes
function getQuotes() {
  return fetch('http://localhost:3000/quotes')
    .then(resp => resp.json())
}

// add quote
function postQuote(quote) {
  return fetch('http://localhost:3000/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quote)
  })
}

// delete quote
function removeQuote() {
  return fetch(`http://localhost:3000/quotes/${state.selectedQuote.id}`, {
    method: 'DELETE'
  })
}

// update quote
function updateQuote() {
  return fetch(`http://localhost:3000/quotes/${state.selectedQuote.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state.selectedQuote)
  })
  .then(resp => resp.json())
}

function fetchAndRender() {
  getQuotes()
    .then(quotes => {
      state.quotes = quotes
      addQuotes(quotes)
    })
}

// --------------------------  BONUS STUFF  --------------------------------

// add event listener to edit button
function addEventListenerToEditBtn() {
  document.addEventListener('click', event => {
    if(event.target.className === 'btn-warning'){
      quoteId = parseInt(event.target.dataset.id)
      state.selectedQuote = state.quotes.filter( quote => quote.id === quoteId )[0]
      changeQuote(quoteId)
    }
  })
}

// render the change quote form
function changeQuote(id) {
  const quote = state.selectedQuote
  const editQuoteEl = document.querySelector(`.quote-card[data-id='${id}']`);
  editQuoteEl.className = `edit-form-${id}`
  editQuoteEl.innerHTML = `
    <blockquote class="blockquote">
      <input type="textarea" name="quote" value="${quote.quote}">
      <footer class="blockquote-footer"><input type="text" name="quote" value="${quote.author}"></footer>
      <br>
      <button data-id='${quote.id}' class="btn-warning save-btn">Save</button>
    </blockquote>
  `
  const saveBtn = editQuoteEl.querySelector('.save-btn');
  saveBtn.addEventListener('click', editQuote)
}

// will change quote when save button pressed
function editQuote() {
  const editForm = document.querySelector(`.edit-form-${state.selectedQuote.id}`);
  state.selectedQuote.quote = editForm.querySelectorAll('input')[0].value;
  state.selectedQuote.author = editForm.querySelectorAll('input')[1].value;
  updateQuote(state.selectedQuote)
    .then(fetchAndRender);
}

// add add event listener to sort button
function addEventListenerToSortButton() {
  document.addEventListener('click', event => {
    if(event.target.className === 'btn-secondary') {
      state.sorted = !state.sorted
      addQuotes(state.quotes)
    }
  })
}

// sorts all quotes by author name
function sortByAuthor() {
  const orderedQuotes = [...state.quotes];
  console.log(orderedQuotes, state.quotes)
  return orderedQuotes.sort(compareAuthors);
}

// function that compares the authors names within the quoteg object
function compareAuthors(quote1, quote2) {
  if (quote1.author < quote2.author ){
    return -1;
  } else if (quote1.author > quote2.author){
    return 1;
  } else {
    return 0;
  }
}

// ----------------------- Page initialize ----------------------------------

// on page load
function initialization() {
  fetchAndRender();
  addEventListenerToSubBtn();
  addEventListenerToEditBtn();
  addEventListenerToSortButton()
}

initialization()
