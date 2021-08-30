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

learnWordsBtn.addEventListener('click', launchLearnWords);
flashcardsBtn.addEventListener('click', launchFlashcards);
myWordsBtn.addEventListener('click', launchMyWords);
spellingBeeBtn.addEventListener('click', launchSpellingBee);

async function getDictEntry(word) {
    try{
        // get data for word from dictionary API
        let res = await axios.get(`${dictBaseURL}${word}${dictKey}`);
        console.log(res)
        if (typeof res.data[0] === 'string') {
            append(`did you mean`,res.data[0])
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

            let def = res.data[0].shortdef[0];
            let pos = res.data[0].fl;
            let audioURL = `${audioBaseURL}${audioSub}/${audioName}.mp3`;
            let wordArray = [def, pos, audioURL];
            append('part of speech', wordArray[1]);
            append('definition', wordArray[0]);
            
            return wordArray;
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
        let synonyms = res.data[0].meta.syns[0];
        
        append('synonyms', synonyms);
        
        
        return synonyms;
    } catch (error) {
        console.log(error);
    }
 }

 // get random word for word of the day function
 async function getRandomWord() {
    try{
        // get data for word from dictionary API
        let res = await axios.get(`${randomWordURL}`);
        let wotd = res.data[0].word;
        let wotdDef = res.data[0].definition;
        
        return {
            wotd, 
            wotdDef
        };

    } catch (error) {
        console.log(error);
    }
 }

 // Append data to DOM by keyword and content
const content = document.querySelector('#content');

function append(keyword, data) {
    
    let newContent = document.createElement('p');
    newContent.innerText = `${keyword}: ${data}`;
    contentDiv.appendChild(newContent);
}

// getDictEntry('affable');
// getThesEntry('affable');
// getRandomWord();

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
    
}

// search dictionary upon input value
function searchDict(event) {
    event.preventDefault;
    contentDiv.innerHTML = '';
    const inputValue = searchInput.value;
    
    let wordArr = getDictEntry(inputValue);
    
    
    searchInput.value = '';
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

    // cardBtn.classList.add('card-button');
    // searchDiv.append(searchInput);
    // searchDiv.append(searchBtn);

    // searchBtn.addEventListener('click', searchDict);
}

function launchMyWords() {

}

function launchSpellingBee() {

}

function launchWotd() {
    getDictEntry('hello');
}
// const button = document.querySelector('#pronounce');
// button.addEventListener('click', playAudio(wordAudio))

// function play() {
//     var audio = document.getElementById("audio");
//     audio.src = getDictionary('pleasant');
//     audio.play();
//   }