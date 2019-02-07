const quotesUrl = 'http://localhost:3000/quotes'
const quoteListEl = document.querySelector('#quote-list');
const formEl = document.querySelector('#new-quote-form');
const editForm = document.createElement('blockquote');
const sortBtn = document.querySelector('.btn-light');

//STATE///////////////////////////////////////////////////////////////////

const state = {
        quotes: [],
        selectedQuote: null,
        filtered: false
    };

//RENDER MAIN LIST QUOTES////////////////////////////////////////////////

//render

const appendQuote = (quoteItem) => {
    const quoteLi = document.createElement('li');

    quoteLi.className = 'quote-card'
    quoteLi.innerHTML = `<blockquote class="blockquote">
                            <p class="mb-0">${quoteItem.quote}</p>
                            <footer class="blockquote-footer">${quoteItem.author}</footer>
                            <br>
                            <button class='btn-success'>Likes: <span>${quoteItem.likes}</span></button>
                            <button class='btn-info'>Edit</button>
                            <button class='btn-danger'>Delete</button>
                         </blockquote>`;

    quoteListEl.appendChild(quoteLi);
};

const renderQuotes = (inQuotes=state.quotes) => {
    quoteListEl.innerHTML = '';

    inQuotes.forEach(appendQuote);
};

const renderEditForm = (parentEl) => {
    const quoteElem = state.selectedQuote;

    editForm.innerHTML = `<form id="edit-quote-form">
                              <div class="form-group">
                                <label for="new-quote">Quote</label>
                                <input type="text" class="form-control" id="new-quote" value="${quoteElem.quote}">
                              </div>
                              <div class="form-group">
                                <label for="Author">Author</label>
                                <input type="text" class="form-control" id="author" value="${quoteElem.author}">
                              </div>
                              <button type="submit" class="btn btn-primary">Submit</button>
                            </form>`;
    // debugger
    parentEl.append(editForm);
    editSubmitBtnListener(editForm);

};

//sort functions

const compareByAuthor = (quoteA, quoteB) => {
    return quoteA.author.localeCompare(quoteB.author)
};

const sortByAuthor = () => {
    const quotes = [...state.quotes];

    return quotes.sort(compareByAuthor);
};

//FORM SECTION//////////////////////////////////////////////////////////////////

const grabFormSubmition = (form) => {
    // debugger
    return {
        quote: form.querySelector('#new-quote').value,
        author: form.querySelector('#author').value,
        likes: 0
    };
};

//EVENT LISTENERS///////////////////////////////////////////////////////////////

const findQuote = () => {
    const quoted = event.target.parentElement.querySelector('.mb-0');
    const clickedQuote = state.quotes.find(elem => elem.quote === quoted.innerText);
    // debugger
    state.selectedQuote = clickedQuote;
};

//create

const submitBtnListener = (form) => {
    form.addEventListener('submit', event => {
        event.preventDefault();

        postQuote(grabFormSubmition(form))
            .then(() => getQuotes())
            .then(jso => {
                state.quotes = jso;
                renderQuotes();
                });
    form.reset()
    });
};

//edit

const editSubmitBtnListener = (form) => {
    form.addEventListener('submit', event => {
        event.preventDefault();
        const data = grabFormSubmition(form)

        data.likes = state.selectedQuote.likes
        data.id = state.selectedQuote.id 

        patchQuote(data)
            .then(() => getQuotes())
            .then(jso => {
                state.quotes = jso;
                renderQuotes();
            });
    });
};

//quote

const quoteBtnsListener = () => {
    quoteListEl.addEventListener('click', event => {
        if (event.target.tagName === 'BUTTON') {
            findQuote()

            if (event.target.className === 'btn-success') {
                state.selectedQuote.likes += 1
                patchQuote()
                    .then(() => getQuotes())
                    .then(jso => {
                        state.quotes = jso;
                        renderQuotes();
                });
            } else if (event.target.className === 'btn-danger') {
                deleteQuote()
                    .then(() => getQuotes())
                    .then(jso => {
                        state.quotes = jso;
                        renderQuotes();
                    });
            } else {
                [...document.querySelectorAll('.btn-info')].forEach(btn => btn.disabled = false);
                event.target.disabled = true
                // debugger
                renderEditForm(event.target);
            };
        };
    });
};

//sort

const sortBtnListener = () => {
    sortBtn.addEventListener('click', () => {
        state.filtered = !state.filtered
        // debugger
        state.filtered ? renderQuotes(sortByAuthor()) : renderQuotes();
    })
};
//SERVER FETCHS/////////////////////////////////////////////////////////////////

const getQuotes = () => {
    return fetch(quotesUrl)
        .then(resp => resp.json());
};

const postQuote = (quote) => {
    return fetch(quotesUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(quote)
    }).then(resp => resp.json());
};

const patchQuote = (quote=state.selectedQuote) => {
    // debugger
    return fetch(`${quotesUrl}/${quote.id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(quote)
    }).then(resp => resp.json());
};

const deleteQuote = (quote=state.selectedQuote) => {
    return fetch(`${quotesUrl}/${quote.id}`, {
        method: 'DELETE'
    });
};

//INITIALISE////////////////////////////////////////////////////////////////////

const init = () => {
    getQuotes()
        .then(jso => {
            state.quotes = jso;
            renderQuotes();
        });
    submitBtnListener(formEl);
    quoteBtnsListener();
    sortBtnListener();
};

init();