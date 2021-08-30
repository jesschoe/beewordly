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
            let definition = res.data[0].shortdef[0];
            let pos = res.data[0].fl;
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

            audioURL = `${audioBaseURL}${audioSub}/${audioName}.mp3`;
            
            append('part of speech', pos);
            append('definition', definition);

            

            return {
                definition,
                pos,
                audioURL,
            }
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
    contentDiv.innerHTML = '';
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
    
    contentName.innerHTML = '<h2>Learn Words</h2>';
    searchDiv.innerHTML = '<p>Search for words to learn their part of speech, meaning, and synonyms</p>'

    // searchInput = document.createElement('input');
    let searchBtn = document.createElement('button');
    searchBtn.classList.add('search-button');
    searchDiv.append(searchInput);
    searchDiv.append(searchBtn);

    searchBtn.addEventListener('click', searchDict);
    
}

// search dictionary upon input value
function searchDict(event) {
    event.preventDefault;
    const inputValue = searchInput.value;
    getDictEntry(inputValue);
    searchInput.value = '';
}

function playAudio(){
    let audio = new Audio(audioURL);       // seek to the start
    audio.play();                // play it till it ends
}

function launchFlashcards() {
    // contentName.innerHTML = '<h2>Flashcards</h2>';
    // searchDiv.innerHTML = '<p>Flip the flashcard to see the meaning</p>'

    // // searchInput = document.createElement('input');
    // let cardBtn = document.createElement('button');
    // cardBtn.classList.add('card-button');
    // searchDiv.append(searchInput);
    // searchDiv.append(searchBtn);

    // searchBtn.addEventListener('click', searchDict);
}

function launchMyWords() {

}

function launchSpellingBee() {

}

// const button = document.querySelector('#pronounce');
// button.addEventListener('click', playAudio(wordAudio))

// function play() {
//     var audio = document.getElementById("audio");
//     audio.src = getDictionary('pleasant');
//     audio.play();
//   }