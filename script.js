const dictBaseURL = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';
const dictKey = '?key=9aed0fc9-9efb-4167-83b0-c665d40f56b7';
const audioBaseURL = 'https://media.merriam-webster.com/audio/prons/en/us/mp3/'
let audioURL = '';
const thesBaseURL = 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/';
const thesKey = '?key=55b8d793-ca1e-4767-9965-51dff650f096'

const randomWordURL = 'https://random-words-api.vercel.app/word';

const contentDiv = document.querySelector('#content');
const contentName = document.querySelector('#content-name');
const learnWordsBtn = document.querySelector('#learn-words');
const flashcardsBtn = document.querySelector('#flashcards');
const myWordsBtn = document.querySelector('#my-words');
const spellingBeeBtn = document.querySelector('#spelling-bee');
console.log(document.body);

let wordObject = {
    // def: '',
    // pos: '',
    // syns: [],
    // audioURL: '',
};

learnWordsBtn.addEventListener('click', launchLearnWords);
flashcardsBtn.addEventListener('click', launchFlashcards);
myWordsBtn.addEventListener('click', launchMyWords);
spellingBeeBtn.addEventListener('click', launchSpellingBee);

async function getDictEntry(word) {
    try{
        // get data for word from dictionary API
        let res = await axios.get(`${dictBaseURL}${word}${dictKey}`);
        // console.log(res)
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
        console.log(res)
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



async function getWotd() {
    let wotd = await getRandomWord();
    contentName.innerHTML = `<h2>Word of the Day: ${wotd.word}<h2>`;
    appendData('definition', wotd.definition);
}
 // get random word for word of the day function
async function getRandomWord() {
    try{
        // get data for word from dictionary API
        let res = await axios.get(`${randomWordURL}`);
        let randomWord = res.data[0];
        
        return randomWord;
    } catch (error) {
        console.log(error);
    }
}

 // Append data to DOM by keyword and content
const content = document.querySelector('#content');

function appendData(keyword, data) {
    
    let newContent = document.createElement('p');
    newContent.innerText = `${keyword}: ${data}`;
    contentDiv.appendChild(newContent);
}

 // Button handlers

const searchInput = document.createElement('input');
const searchDiv = document.querySelector('#search-dictionary');

function launchLearnWords(event) {
    contentDiv.innerHTML = '';
    contentName.innerHTML = '<h2>Learn Words</h2>';
    searchDiv.innerHTML = '<p>Search for words to learn their part of speech, meaning, and synonyms</p>'

    // searchInput = document.createElement('input');
    let searchBtn = document.createElement('button');
    searchBtn.classList.add('search-button');
    searchBtn.innerText = 'search';
    searchInput.placeholder = 'enter a word';
    
    searchDiv.append(searchInput);
    searchDiv.append(searchBtn);

    searchBtn.addEventListener('click', searchDict);
    // searchInput.addEventListener('keypress', function onEvent(e) {
    //     e.preventDefault();
    //     if (e.key === 'Enter') {
    //         searchBtn.click();
    //     } else {
    //        return `${e.key}`;
    //     }
    // })
    
}

// search dictionary upon input value
function searchDict(event) {
    // referenced the following stackoverflow on how to return values from async functions:
    // https://stackoverflow.com/questions/49938266/how-to-return-values-from-async-functions-using-async-await-from-function
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

function playAudio(){
    let audio = new Audio(audioURL);       // seek to the start
    audio.play();                // play it till it ends
}

const cardArray = [];
function launchFlashcards() {
    contentDiv.innerHTML = '';
    contentName.innerHTML = '<h2>Flashcards</h2>';
    searchDiv.innerHTML = '<p>enter up to 10 words to create your deck of flashcards</p>'
    const textInput = document.createElement('input');
    const addBtn = document.createElement('button');
    addBtn.classList.add('search-button');
    addBtn.innerText = 'add';
    textInput.placeholder = 'enter a word';
    searchDiv.append(textInput);
    searchDiv.append(addBtn);

    addBtn.addEventListener('click', addWords);
}

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

async function createFlashcards() {
    contentDiv.innerHTML = '';
    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card-div');
    contentDiv.appendChild(cardDiv);
    searchDiv.innerHTML = '<p>click to see definition</p>';
    document.querySelector('ol').innerHTML = '';
    
    cardArray.forEach((card, index) => {
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

function launchSpellingBee() {
    contentDiv.innerHTML = '';
    contentName.innerHTML = '<h2>Spelling Bee</h2>';
    searchDiv.innerHTML = "<p>Press 'question' when you're ready.. the word will only play once!</p>";
    
    const playBtn = document.createElement('button');
    playBtn.setAttribute('id', 'play-button')
    playBtn.innerText = 'question'

    const audioDiv = document.createElement('audio');

    
    
    

    contentDiv.append(playBtn);
    contentDiv.append(audioDiv);
  

    playBtn.addEventListener('click', playAudio())
    // spellingBtn.addEventListener('click', submitAnswer)
}

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
                const question = document.querySelector('#play-button');
                question.remove();
                const spellingInput = document.createElement('input');
                spellingInput.placeholder = 'enter spelling';
                const spellingBtn = document.createElement('button');
                spellingBtn.innerText = 'submit';
                spellingBtn.setAttribute('class', 'search-button');
                contentDiv.append(spellingInput);
                contentDiv.append(spellingBtn);

                spellingBtn.addEventListener('click', function() {
                    console.log(spellingInput.value, randomArray[i].toLowerCase(), 'hello')
                    if (spellingInput.value == randomArray[i].toLowerCase()) {
                        searchDiv.innerHTML = "<p>Wow, how'd you get that right?!</p>";
                    } else {
                        searchDiv.innerHTML = "<p>You're a terrible speller, try again?</p>";
                    }

                    spellingInput.remove();
                    spellingBtn.removeAttribute('class', 'search-button');
                    spellingBtn.innerText = 'question';
                    
                    spellingBtn.addEventListener('click', launchSpellingBee);


                })


                break;
            }
        }
        
    })()
    // let playBtn = document.querySelector('#play-button');
    // playBtn.addEventListener('click', playAudio())
}

