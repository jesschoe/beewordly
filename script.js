// Declare API URLs
const dictBaseURL = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';
const dictKey = '?key=9aed0fc9-9efb-4167-83b0-c665d40f56b7';
const audioBaseURL = 'https://media.merriam-webster.com/audio/prons/en/us/mp3/'
let audioURL = '';
const thesBaseURL = 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/';
const thesKey = '?key=55b8d793-ca1e-4767-9965-51dff650f096'
const randomWordURL = 'https://random-words-api.vercel.app/word';

// Declare DOM elements
const contentDiv = document.querySelector('#content');
const contentName = document.querySelector('#content-name');
const searchDiv = document.querySelector('#search-div');
const searchSubmit = document.querySelector('.search-bar');
searchSubmit.addEventListener('submit', searchDict)

// toggle function for hamburger menu
const toggleBtn = document.querySelector('.toggle');
const navLinks = document.querySelector('.nav-links');

toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Returns word object that contains a word's definition, part of speech, audio URL, and synonyms
async function getDictEntry(word) {
    try{
        // get data for word from dictionary API
        let res = await axios.get(`${dictBaseURL}${word}${dictKey}`);
      
        // If there is no dictionary entry for the word, return suggestion
        if (typeof res.data[0] === 'string') {
            const suggestions = res.data[0];
            return suggestions;
        } else {
            let audio = res.data[0].hwi.prs[0].sound;
            let audioName = audio.audio;
            let firstChar = audioName[0].charAt(0);

            // get data for correct format of audio URL of word
            if (audioName.substring(0,2) === 'gg') {
                audioSub = 'gg';
            } else if (audioName.substring(0,3) === 'bix') {
                audioSub = 'bix';
            } else if (firstChar <='9' && firstChar >='0') {
                audioSub = 'number';
            } else {
                audioSub = audioName[0];
            }
            
            const wordObject = {
                def: res.data[0].shortdef[0],
                pos: res.data[0].fl,
                audioURL: `${audioBaseURL}${audioSub}/${audioName}.mp3`,
                syns: await getThesEntry(word),
            };
            return wordObject;
        }
    } catch (error) {
        console.log(error);
    }
}

// Get thesaurus entry for word and return array of synonyms
async function getThesEntry(word) {
    try{
        // get data for word from dictionary API
        let res = await axios.get(`${thesBaseURL}${word}${thesKey}`);
     
        if (typeof res.data[0] === 'string') {
            return res.data[0];
        } else {
            let synonyms = res.data[0].meta.syns[0];
            if (synonyms.length > 5) {
                synonyms.splice(4);
            }
            return synonyms;
        }   
    } catch (error) {
        console.log(error);
    }
}

// Appends word of the day to page on load/refresh
async function getWotd() {
    let randomWord = await getRandomWord();
    let dictionaryWord = await getDictEntry(randomWord.word);

    if (typeof dictionaryWord === 'string') {
        getWotd();
    } else {
        createWordCard(randomWord.word, dictionaryWord);
    }
}

 // Get random word from random word generator API
async function getRandomWord() {
    try{
        let res = await axios.get(`${randomWordURL}`);
        let randomWord = res.data[0];
        return randomWord;
    } catch (error) {
        console.log(error);
    }
}

// Append a card to the page with the word and word's info
function createWordCard(word, wordObj) {
    let synsStr = 'no synonyms';
    if (typeof wordObj.syns === 'object') {
        synsStr = (wordObj.syns).join(', ');
    } 

    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card-div');
    contentDiv.appendChild(cardDiv);

    const cardWord = document.createElement("div");
    cardWord.classList.add('card-word', `word${word}`);
    cardWord.innerHTML = `<h3>${word}</h3>`;

    const cardDef = document.createElement("div");
    cardDef.classList.add('card-def',`${word}`);
    cardDef.innerHTML =`<p>${wordObj.pos}-- ${wordObj.def}</p><p>synonyms: ${synsStr}</p>`;
    
    const myWordsDiv = document.createElement('div');
    const myWordsBtn = document.createElement('img');
    myWordsBtn.src = './images/star1.svg';
    myWordsBtn.alt = 'empty star icon';
    myWordsBtn.setAttribute('id', `${word}`)
    myWordsBtn.classList.add('star1');
    myWordsBtn.addEventListener('click', saveWord);

    cardDiv.appendChild(cardWord);
    cardWord.appendChild(cardDef);
    cardDiv.appendChild(myWordsBtn);
}

// Toggle icons and class names for starred words
function saveWord(event) {
    const wordClass = event.path[0].classList[0];
    const wordId = event.path[0].id;
    const getWord = document.querySelector(`#${wordId}`);
 
    if(wordClass === 'star1') {
        getWord.src = './images/star2.svg';
        getWord.alt = 'filled star icon';
        getWord.classList.remove('star1');
        getWord.classList.add('star2');
        const word = event.path[0].id;
        localStorage.setItem(word, word);
        getWord.addEventListener('click', saveWord);
    } else {
        getWord.src = './images/star1.svg';
        getWord.alt = 'empty star icon';
        getWord.classList.remove('star2');
        getWord.classList.add('star1');
        const word = event.path[0].id;
        localStorage.removeItem(word);
        getWord.addEventListener('click', saveWord);
    }
}

// Create a form
function createForm() {
    const searchForm = document.createElement('form');
    searchForm.setAttribute('id', 'new-form')
    const searchLabel = document.createElement('label');
    searchLabel.for = 'word';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'enter a word';
    searchInput.name = 'word';
    searchInput.id = 'word';
    
    const searchSubmit = document.createElement('input');
    searchSubmit.classList.add('submit', 'new-submit');
    searchSubmit.type = 'submit';
    searchSubmit.value = 'search';

    searchDiv.append(searchForm);
    searchForm.append(searchLabel);
    searchForm.append(searchInput);
    searchForm.append(searchSubmit);
}

// Search function to look up words from input
function launchLearnWords() {
    contentDiv.innerHTML = '';
    const ol = document.querySelector('ol');
    ol.innerHTML = '';
    contentName.innerHTML = '<h2>Learn Words</h2>';
    searchDiv.innerHTML = '<p>search for words to learn their part of speech, meaning, and synonyms</p>'
    
    createForm();
    const searchForm = document.querySelector('#new-form');
    searchForm.addEventListener('submit', searchDict);  
}

// Find dictionary entry for input and append data to page
function searchDict(event) {
    event.preventDefault();
    launchLearnWords();
    (async () => {
        event.preventDefault();
        contentDiv.innerHTML = '';
        const inputValue = event.target[0].value;
        let wordObj = await getDictEntry(inputValue);
        
        if (typeof wordObj === 'string') {
            const suggest = document.createElement('div');
            suggest.setAttribute('id', 'suggest');
            suggest.innerHTML = `did you mean ${wordObj}?`
            searchDiv.append(suggest);
        } else {
            const suggest = document.querySelector('#suggest');
            console.log(typeof suggest)
            if (suggest !== null) {
                suggest.remove();
            }
            createWordCard(inputValue, wordObj);
        }
        const searchBarInput = document.querySelector('#search-bar-input');
        const searchInput = document.querySelector(`#${inputValue}`);
        searchBarInput.value = '';
        searchInput.value = '';
    })()
}

const cardArray = [];

// Allows user to input words and creates a set of flashcards that toggles between showing/hiding definition
function launchFlashcards() {
    contentDiv.innerHTML = '';
    contentName.innerHTML = '<h2>Flashcards</h2>';
    searchDiv.innerHTML = '<p>enter words to create your deck of flashcards</p>'

    createForm();

    const searchForm = document.querySelector('#new-form');
    const searchInput = document.querySelector('#word');
    const searchBtn = document.querySelector('.new-submit');
    searchBtn.value = 'add';
    searchForm.addEventListener('submit', addWords);
    
    function addWords(event) {
        event.preventDefault();
        const cardValue = searchInput.value;
        if(cardValue != "") {
        cardArray.push(cardValue);
        // clear input
        searchInput.value = "";
        appendCardList();
        }
    }
}

// Append words to list of flashcards to create
function appendCardList() {
    const cardListDiv = document.querySelector('ol');
    cardListDiv.innerHTML = '';
    cardArray.forEach((card, index) => {
        // Create li item
        const li = document.createElement("li");
        li.innerText = card;
        // Create a delete button
        function removeCard(i) {
            cardArray.splice(i, 1);
            appendCardList();
        }

        const button = document.createElement("button");
        button.classList.add('remove-button', 'submit');
        button.addEventListener("click", () => removeCard(index));
        button.innerText = "remove";

        // Append item to page
        li.append(button);
        cardListDiv.appendChild(li);
    });
    
    const flashcardsBtn = document.createElement('button');
    flashcardsBtn.classList.add('create-button', 'submit');
    flashcardsBtn.innerText = 'create flashcards';
    cardListDiv.appendChild(flashcardsBtn);
    flashcardsBtn.addEventListener('click', createFlashcards)
}

// Populate flashcards on the page for each word on the list
function createFlashcards() {
    contentDiv.innerHTML = '';
    searchDiv.innerHTML = '<p>click to see definition</p>';
    document.querySelector('ol').innerHTML = '';
    
    cardArray.forEach((card) => {
        (async () => {
            let wordObj = await getDictEntry(card);

            createWordCard(card, wordObj);
            const cardWord = document.querySelector(`.word${card}`);
            const cardDef = document.querySelector(`.${card}`)
            cardDef.style.display = 'none';

            cardWord.addEventListener('click', function() {
                if (cardDef.style.display === 'none') {
                    cardDef.style.display = 'block';
                } else {
                    cardDef.style.display = 'none';
                }
            })
        })()  
    });
}

// Launch spelling game that plays audio for random words and check to see if user spelled it correctly
function launchSpellingBee() {
    contentDiv.innerHTML = '';
    const ol = document.querySelector('ol');
    ol.innerHTML = '';
    contentName.innerHTML = '<h2>Spelling Bee!</h2>';
    searchDiv.innerHTML = "<p>Get ready.. the word will only play once!</p><p>Type your guess here:</p>";

    const audioDiv = document.createElement('audio');
    searchDiv.append(audioDiv);
    
    createForm();
    const submitBtn = document.querySelector('.new-submit');
    submitBtn.value = 'submit';
    playAudio();
}

// Append audio URL for random word and play upon loading content
async function playAudio() {
 
    let audioData = document.querySelector("audio");
    let randomWord = await getRandomWord();
    let dictionaryWord = await getDictEntry(randomWord.word);

    if (typeof dictionaryWord === 'string') {
        playAudio();
    } else {
        audioData.src = dictionaryWord.audioURL;
        audioData.play();
                
        const searchForm = document.querySelector('#new-form');
        const spellingInput = document.querySelector('#word');
        const restartBtn = document.createElement('button');
        restartBtn.classList.add('create-button', 'submit');
        restartBtn.innerText = 'play again';
                
        // Check if input matches word's spelling
        searchForm.addEventListener('submit', function(event) {
        event.preventDefault();

            if (spellingInput.value === randomWord.word.toLowerCase()) {
                searchDiv.innerHTML = `<p>Wow! You got it!</p>`;
                restartBtn.addEventListener('click', launchSpellingBee);
                searchDiv.append(restartBtn);
                createWordCard(randomWord.word.toLowerCase(), dictionaryWord);
            } else {
                searchDiv.innerHTML = `<p>You're a terrible speller.</p>`;
                restartBtn.addEventListener('click', launchSpellingBee);
                searchDiv.append(restartBtn);
                createWordCard(randomWord.word.toLowerCase(), dictionaryWord);
            }
            searchForm.remove();
        })
                
    }
}

// Pull saved words from local storage and display 
function launchMyWords() {
    contentDiv.innerHTML = '';
    contentName.innerHTML = '<h2>My Words</h2>';
    searchDiv.innerHTML = '<p>manage your saved words here</p>'
    const clearBtn = document.createElement('button');
    clearBtn.innerText ='clear all words';
    clearBtn.classList.add('create-button', 'submit');
    searchDiv.append(clearBtn);

    clearBtn.addEventListener('click', () => {
        localStorage.clear();
        launchMyWords();
    })

    let savedWords = [];
    let keys = Object.keys(localStorage);

    for (const [key, value] of Object.entries(localStorage)) {
        savedWords.push(`${value}`);
    }

    savedWords.forEach(word => {
        (async () => {
            dictEntry = await getDictEntry(word);
            createWordCard(word, dictEntry);
            let starred = document.querySelector('.star1');
            starred.src = './images/star2.svg';
            starred.setAttribute('id', word)
            starred.classList.remove('star1');
            starred.classList.add('star2');
            starred.addEventListener('click', removeSavedWord);
        })()
    })
}

// Remove a saved word from local storage
function removeSavedWord(event) {
    localStorage.removeItem(`${event.path[0].id}`)
    launchMyWords();
}