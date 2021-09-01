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
const searchDiv = document.querySelector('#search-dictionary');
const learnWordsBtn = document.querySelector('#learn-words');
const flashcardsBtn = document.querySelector('#flashcards');
const myWordsBtn = document.querySelector('#my-words');
const spellingBeeBtn = document.querySelector('#spelling-bee');
console.log(document.body);

// Event Listeners for nav buttons
// learnWordsBtn.addEventListener('click', launchLearnWords);
// learnWordsBtn.onclick = launchLearnWords;
flashcardsBtn.addEventListener('click', launchFlashcards);
myWordsBtn.addEventListener('click', launchMyWords);
spellingBeeBtn.addEventListener('click', launchSpellingBee);

// Returns word object that contains a word's definition, part of speech, audio URL, and synonyms
async function getDictEntry(word) {
    try{
        // get data for word from dictionary API
        let res = await axios.get(`${dictBaseURL}${word}${dictKey}`);
        // console.log(res)
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

            // let wordDef = res.data[0].shortdef[0];
            // for (let i = 0; i < wordDef.length; i++) {
            //     if (wordDef[i] === '-') {
            //         let shortDef = wordDef.substring(i,10)
            //     }
            // }
            
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
            return synonyms;
        }   
    } catch (error) {
        console.log(error);
    }
}

// Appends word of the day to page on load/refresh
async function getWotd() {
    let wotd = await getRandomWord();
    contentName.innerHTML = `<h2>Word of the Day<h2>`;
    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card-div');
    cardDiv.setAttribute('id', 'wotd');
    contentDiv.appendChild(cardDiv);
    const cardWord = document.createElement("div");
    const cardDef = document.createElement("div")
    cardWord.innerHTML = `<p>${wotd.word}</p>`;
    cardWord.classList.add('card-word');
    cardDef.innerText = wotd.definition;
    cardDef.classList.add('card-def');
    cardDiv.appendChild(cardWord);
    cardWord.appendChild(cardDef);
   
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

// Append data to page by keyword and content
function appendData(keyword, data) {
    let newContent = document.createElement('p');
    newContent.innerText = `${keyword}: ${data}`;
    contentDiv.appendChild(newContent);
}

// Search function to look up words from input
function launchLearnWords(event) {
    contentDiv.innerHTML = '';
    contentName.innerHTML = '<h2>Learn Words</h2>';
    searchDiv.innerHTML = '<p>search for words to learn their part of speech, meaning, and synonyms</p>'
    
    const searchForm = document.createElement('form');
    const searchLabel = document.createElement('label');
    searchLabel.for = 'word';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.name = 'word';
    searchInput.id = 'word';
    
    const searchSubmit = document.createElement('input');
    searchSubmit.type = 'submit';
    searchSubmit.value = 'Submit';

    searchDiv.append(searchForm);
    searchForm.append(searchLabel);
    searchForm.append(searchInput);
    searchForm.append(searchSubmit);
    searchForm.addEventListener('submit', searchDict);  

    // Find dictionary entry for input and append data to page
    function searchDict(event) {
        event.preventDefault();
        (async () => {
            event.preventDefault;
            contentDiv.innerHTML = '';
            const inputValue = searchInput.value;
            let wordObj = await getDictEntry(inputValue);
            searchInput.value = '';
            
            if (typeof wordObj === 'string') {
                appendData(`did you mean`, wordObj)
            } else {
                appendData('part of speech', wordObj.pos);
                appendData('definition', wordObj.def);
    
                let synsStr = (wordObj.syns).join(', ');
                appendData('synonyms', synsStr)
            }
        })()
    }
}

const cardArray = [];

// Allows user to input words and creates a set of flashcards that toggles between showing/hiding definition
function launchFlashcards() {
    contentDiv.innerHTML = '';
    contentName.innerHTML = '<h2>Flashcards</h2>';
    searchDiv.innerHTML = '<p>enter up to 10 words to create your deck of flashcards</p>'
    // const textInput = document.createElement('input');
    // const addBtn = document.createElement('button');
    // addBtn.classList.add('search-button');
    // addBtn.innerText = 'add';
    // textInput.placeholder = 'enter a word';
    // searchDiv.append(textInput);
    // searchDiv.append(addBtn);

    // addBtn.addEventListener('click', addWords);
    const searchForm = document.createElement('form');
    const searchLabel = document.createElement('label');
    searchLabel.for = 'word';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.name = 'word';
    searchInput.id = 'word';
    
    const searchSubmit = document.createElement('input');
    searchSubmit.type = 'submit';
    searchSubmit.value = 'Submit';

    searchDiv.append(searchForm);
    searchForm.append(searchLabel);
    searchForm.append(searchInput);
    searchForm.append(searchSubmit);
    searchForm.addEventListener('submit', addWords);  
}

// Adds words to the flashcards array
function addWords(event) {
    event.preventDefault();
    const textInput = document.querySelector('input');
    const cardValue = textInput.value;
    if(cardValue != "") {
    cardArray.push(cardValue);
    // clear input
    textInput.value = "";
    appendCardList();
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
        button.classList.add('search-button');
        button.addEventListener("click", () => removeCard(index));
        button.innerText = "remove";

        // Append item to page
        li.append(button);
        cardListDiv.appendChild(li);
    });
    
    const flashcardsBtn = document.createElement('button');
    flashcardsBtn.classList.add('create-button');
    flashcardsBtn.innerText = 'create flashcards';
    cardListDiv.appendChild(flashcardsBtn);
    flashcardsBtn.addEventListener('click', createFlashcards)
}

// Populate flashcards on the page for each word on the list
async function createFlashcards() {
    contentDiv.innerHTML = '';
    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card-div');
    contentDiv.appendChild(cardDiv);
    searchDiv.innerHTML = '<p>click to see definition</p>';
    document.querySelector('ol').innerHTML = '';
    
    cardArray.forEach((card) => {
        (async () => {
            let cardData = await getDictEntry(card);
            const cardWord = document.createElement("div");
            const cardDef = document.createElement("div")
            cardWord.innerHTML = `<p>${card}</p>`;
            cardWord.classList.add('card-word');
            
            cardDef.innerText = cardData.def;
            cardDef.classList.add('card-def');
            cardDef.style.display = 'none';

            cardDiv.appendChild(cardWord);
            cardWord.appendChild(cardDef);

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

function launchMyWords() {

}

// Launch spelling game that plays audio for random words and check to see if user spelled it correctly
function launchSpellingBee() {
    contentDiv.innerHTML = '';
    contentName.innerHTML = '<h2>Spelling Bee!</h2>';
    searchDiv.innerHTML = "<p>Get ready.. the word will only play once!</p><p>Type your guess here:</p>";

    const audioDiv = document.createElement('audio');
    searchDiv.append(audioDiv);
    

    const searchForm = document.createElement('form');
    const searchLabel = document.createElement('label');
    searchLabel.for = 'spelling';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.name = 'spelling';
    searchInput.id = 'spelling';
    
    const searchSubmit = document.createElement('input');
    searchSubmit.type = 'submit';
    searchSubmit.value = 'Submit';

    contentDiv.append(searchForm);
    searchForm.append(searchLabel);
    searchForm.append(searchInput);
    searchForm.append(searchSubmit);
     
    playAudio();
}

// Append audio URL for random word and play upon button click
async function playAudio() {
 
    let audioData = document.querySelector("audio");
    let randomArray = [];
    for (let i = 0; i < 20; i++) {
        let randomWord = await getRandomWord();
        randomArray[i] = randomWord.word;
    }

    

    (async () => {
        for (let i = 0; i < 20; i++) {
            let dictionaryWord = await getDictEntry(randomArray[i]);
    
            if (typeof dictionaryWord === 'object') {
                audioData.src = dictionaryWord.audioURL;
                audioData.play();
                
                // Check if input matches word's spelling
                const searchForm = document.querySelector('form');
                const spellingInput = document.querySelector('#spelling');
                searchForm.addEventListener('submit', function(event) {
                    event.preventDefault();
                    if (spellingInput.value == randomArray[i].toLowerCase()) {
                        searchDiv.innerHTML = `<p>Wow! You got it!</p>
                            <p>${randomArray[i].toLowerCase()}</p>
                            <p><span class='italic'>${dictionaryWord.def}.</span></p>
                            <p>Play again</p>`;
                    } else {
                        searchDiv.innerHTML = `
                            <p>You're a terrible speller.</p>
                            <p>The answer is: ${randomArray[i].toLowerCase()}</p>
                            <p><span class='italic'>${dictionaryWord.def}.</span></p>
                            <p>Try again?</p>`;
                    }

                    searchForm.remove();
                    const restartBtn = document.createElement('button');
                    restartBtn.innerText = 'restart';
                    contentDiv.append(restartBtn);
                    restartBtn.addEventListener('click', launchSpellingBee)
                })
                break;
            }
        }
    })()
}

