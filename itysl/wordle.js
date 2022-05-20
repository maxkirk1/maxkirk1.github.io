let guessCount = 0;
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const WORDS = {
	'troll': 'No, no not Troll Boy. It\'s not going to be Troll Boy',
	'nacho': 'We have a rule that basically says if two people order nachos to share, one person can\'t take the ones with meat and stuff.', 
	'lunch': 'You can\'t skip lunch.',
	'bones': 'The bones are their money.', 
	'ideas': 'You have no good car ideas.', 
	'flash': 'I found this badass store called Dan Flashes that\'s my exact style.', 
	'table': 'And I don\'t want any questions about the tables!', 
	'jamie': 'I\'m never going to say my lines faster than Jamie Taco.', 
	'choke': 'You\'re going to die because you\'re too embarrassed to choke in front of Caleb Wendt.', 
	'dumps': 'Ultimately I guess I wanted people to think Dave was taking huge embarrassing dumps.',
	'turbo': 'You\'re not part of the turbo team', 
	'chode': 'We got a certified chode on our hands.', 
	'steak': 'Sloppy steaks at Truffoni\'s. big rare cut of meat with water dumped all over it, water splashing around the table, makes the night so much more fun.', 
	'daffy': 'Tiny Dinky Daffy, 1927-2019, Pancaked by Drunk Dump Truck Driver',
	'craps': 'I\'m 62 pounds, and Tammy Craps is my favorite doll.', 
	'snarf': 'They’re mad cause I won best hog at the hog shit snarfing contest', 
	'ghost': '', 
	'havoc': '',
	'horny': '', 
	'organ': '', 
	'pants': '', 
	'santa': '',
	'tammy': '', 
	'gimme': 'that burger looks so good. gimme that!', // TODO
	'slice': 'you made a big mud pie and took too small a slice', //TODO
	'dinky': 'Tiny Dinky Daffy, 1927-2019, Pancaked by Drunk Dump Truck Driver',
	
	
};
const KEYS = Object.keys(WORDS);

document.addEventListener('keydown', logKey);

const startDate = new Date("05/17/2022");
const today = new Date();
const gameNum = datediff(startDate, today);

const answerStr = KEYS[gameNum]
const answer = Array.from(answerStr);
const winText = WORDS[answerStr];
// const answer = Array.from('nacho');

const wordsGuessed = [];
const scores = [];
let word = '';
let wordElements;

let chunkyEl, announceEl, overlayEl;

let chunkyDone = false;
let gameOver = false;

let pastScores = JSON.parse(localStorage.getItem('pastScores') || '[]');
let lastWin = parseInt(localStorage.getItem('lastWin') || '-1');
let currentGame = parseInt(localStorage.getItem('currentGame') || '-1');
let wins = parseInt(localStorage.getItem('wins') || '0');
let losses = parseInt(localStorage.getItem('losses') || '0');
let currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
let maxStreak = parseInt(localStorage.getItem('maxStreak') || '0');
let lifetimeChunkies = parseInt(localStorage.getItem('lifetimeChunkies') || '0');

let alreadyPlayed = (currentGame == gameNum);

window.onload = function startGame() {
	wordElements = document.getElementsByClassName('word');
	// initKeyboard
	initKeyboard();
	initOverlay();
	initAnnounce();
	initAnimations();
	renderStats();

	if (currentGame != gameNum) {
		// clear the wordsGuessed data.
		localStorage.setItem('wordsGuessed', '');

		/*
		if (lastWin != currentGame) {
			// unfinished game.
			currentStreak = 0;
			losses++;
		}
		*/
	}
	
	const wordsString = localStorage.getItem('wordsGuessed');
	if (!wordsString) {
		return;
	}
	const wordsPrevGuessed = wordsString.split(',');
	for(let i = 0; i < wordsPrevGuessed.length; i++) {
		word = wordsPrevGuessed[i];
		updateWordDiv();
		submitWord(false);
	}
}

function deleteLetter() {
	word = word.length ? word.substring(0, word.length - 1) : '';
}

function submitWord(shouldAnimate) {
	localStorage.setItem('currentGame', gameNum);

	if (gameOver || word.length != 5) {
		return;
	}
	if (!isValidWord()) {
		// shake
		const currentWordElement = wordElements[guessCount];
		currentWordElement.classList.add('animate__shakeX', 'animate__animated');
		return;
	}
	wordsGuessed.push(word);
	localStorage.setItem('wordsGuessed', wordsGuessed.join(','));
	const score = [0, 0, 0, 0, 0];
	let mAnswer = [...answer];
	for (let i = 0; i < word.length; i++) {
		if (word[i] == mAnswer[i]) {
			score[i] = 2;
			mAnswer[i] = '-'
		}
	}
	for (let i = 0; i < word.length; i++) {
		for (let j = 0; j < mAnswer.length; j++) {
			if (i == j) {
				continue;
			}
			if (word[i] == mAnswer[j]) {
				score[i] = 1;
				mAnswer[j] = '-';
				break;
			}
		}
	}

	scores.push(score);

	const currentWordElement = wordElements[guessCount];
  	const letters = currentWordElement.children;
  	const wordCopy = word;

  	if (shouldAnimate) {
		animate(letters, score, 0);
		for (let i = 0; i < letters.length - 1; i++) {
			letters[i].addEventListener('animationstart', () => {
				sleep(0.3);
				animate(letters, score, i + 1);
			});
		}
		letters[letters.length - 1].addEventListener('animationstart', () => {
			sleep(0.3);
			// update keys
			updateKeys(score, wordCopy);
		});
	}
	else {
		for (let i = 0; i < letters.length; i++) {
			if (score[i] == 0) {
				letters[i].classList.add('grey');
			}
			else {
				letters[i].classList.add(score[i] == 1 ? 'yellow' : 'green');
			}
		}
		updateKeys(score, wordCopy);
	}

	if (word == answer.join('')) {
		gameOver = true;
		announceLong(winText);

		if (!alreadyPlayed) {
			alreadyPlayed = true;
			updateStats(true);
			renderStats();
		}
	}

	word = '';
	guessCount++;

	if (guessCount >= MAX_GUESSES) {
		gameOver = true;
		announceShort(answer.join(''));

		if (!alreadyPlayed) {
			alreadyPlayed = true;
			updateStats(false);
			renderStats();
		}
	}

	/*
	if (guessCount == 2) {
		doChunky();
		announce("It's a chunky");
	}
	*/
}

function isValidWord() {
	return KEYS.includes(word) || VALIDGUESSES[WORD_LENGTH].includes(word) || ['mudpi'].includes(word);
}

function logKey(e) {
  const c = e.key.toLowerCase();

  if (c.length == 1 && ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) && word.length < 5) {
  	word += c;
  }
  else if (c == 'backspace') {
  	deleteLetter();
  }
  else if (c == 'enter') {
  	submitWord(true);
  }

  // Update the div
  updateWordDiv();
}

function updateWordDiv() {
	if (gameOver) {
		return;
	}

	const currentWordElement = wordElements[guessCount];
  	const letters = currentWordElement.children;
	for (let i = 0; i < WORD_LENGTH; i++) {
  	if (i >= word.length) {
  		letters[i].children[0].textContent = '';
  		letters[i].classList.remove('active');
	} else {
  		letters[i].children[0].textContent = word[i];
  		letters[i].classList.add('active');
  	}
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function animate(letters, score, i) {
	if (score[i] == 0 && getRandomInt(5) == 4) {
		score[i] = 3;
		lifetimeChunkies++;
	}

	if (score[i] == 0) {
		letters[i].classList.add('grey');
	} else if (score[i] == 1) {
		letters[i].classList.add('yellow');
	} else if (score[i] == 2) {
		letters[i].classList.add('green');
	} else if (score[i] == 3) {
		letters[i].classList.add('chunky');
		letters[i].onclick = function(){ 
			doChunky();
		};
	}
}

function updateKeys(score, wordCopy) {
	for (let i = 0; i < score.length; i++) {
		const keyEl = KEYS[wordCopy[i]];
		let keyScore = -1;
		if (keyEl.classList.contains('green')) {
			keyScore = 2;
		} else if (keyEl.classList.contains('yellow')) {
			keyScore = 1;
		} else if (keyEl.classList.contains('grey')) {
			keyScore = 0;
		}
		if (score[i] < keyScore) {
			continue;
		}
		// should update
		let letterColor = 'grey';
		if (score[i] == 2) {
			letterColor = 'green';
		}
		else if (score[i] == 1) {
			letterColor = 'yellow';
		}
		keyEl.classList = 'key';
		keyEl.classList.add(letterColor);
	}
}

function initKeyboard() {
	const rows = [
	['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
	['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 
	['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Delete']];
	const keyboardEl = document.getElementById('keyboard');

	for (let i = 0; i < rows.length; i++) {
		const rowEl = document.createElement('div');
		rowEl.classList.add('row');
		if (i == 1) {
			const spacer = document.createElement('div');
			spacer.classList.add('half');
			rowEl.appendChild(spacer);
		}
		
		for (let j = 0; j < rows[i].length; j++) {
			const c = rows[i][j];
			const keyEl = document.createElement('button');
			keyEl.classList.add('key');
			if (c == 'Enter') {
				keyEl.classList.add('special');
				keyEl.onclick = function(){
					submitWord(true);
				};
			} 
			else if (c == 'Delete') {
				keyEl.classList.add('special');
				keyEl.onclick = function(){ 
					deleteLetter();
					updateWordDiv();
				};
			} 
			else {
				keyEl.onclick = function(){ 
					word += c; 
					updateWordDiv();
				};
			}
			keyEl.textContent = c;
			
			rowEl.appendChild(keyEl);
			KEYS[c] = keyEl;
		}
		if (i == 1) {
			const spacer = document.createElement('div');
			spacer.classList.add('half');
			rowEl.appendChild(spacer);
		}
		
		keyboardEl.appendChild(rowEl);
	}
}

function initAnimations() {
	// preload chunky
	var img=new Image();
    img.src='chunkyface.png';

	chunkyEl = document.getElementById('chunky');
	chunkyEl.addEventListener('animationend', (event) => {
		if (event.animationName == 'zoomIn') {
			chunkyEl.classList.remove('animate__zoomIn', 'animate__animated');
	  		chunkyEl.classList.add('animate__zoomOut', 'animate__animated');
		}
		else if (event.animationName == 'zoomOut') {
			chunkyEl.classList.remove('animate__zoomOut', 'animate__animated');
		  	chunkyEl.style.display = 'none';
		}
	});
	for (let i = 0; i < wordElements.length; i++) {
		wordElements[i].addEventListener('animationend', (event) => {
			if (event.animationName == 'shakeX') {
				wordElements[i].classList.remove('animate__shakeX', 'animate__animated');
			}
			// not sure the below are needed.
			if (event.animationName == 'flipInXX') {
				wordElements[i].classList.remove('animate__flipInXX', 'animate__animated');
			}
			if (event.animationName == 'popout') {
				wordElements[i].classList.remove('animate__popout', 'animate__animated');
			}
		});
	}
}


function doChunky() {
	/*
	if (chunkyDone) {
		const chunkies = document.getElementsByClassName('chunky');
			for (let i = 0; i < chunkies.length; i++) {
			chunkies[i].style.backgroundImage = 'unset';
			chunkies[i].children[0].style.display = 'table-cell';
			return;
		}
	}
	*/

	chunkyDone = true;
	const chunkyPhrases = [
		'It\'s a Chunky!', 
		'You got a Chunky!', 
		'He\'s gobbling up your points!', 
		'Hey, what are you going to...what\'s the plan?', 
		'He\'s eatin\' your points...alright...', 
		'You have to figure out what Chunky does before you come out here', 
		'Chunky, don\'t break his laptop, that\'s expensive', 
		'Chunky, figure out what you do! You had alllll summer to think of it', 
		'That\'s a Chunky. I came up with this game, I know what all the little things are', 
		'What are you doing with the bag Chunky?', 
		'We just have to figure out like what Chunky\'s deal is', 
		'Uh, oh! Chunky\'s here!'];
	announceShort(chunkyPhrases[getRandomInt(chunkyPhrases.length)]);

	chunkyEl.style.display = 'initial';
	chunkyEl.classList.add('animate__zoomIn', 'animate__animated');

	chunkyEl.addEventListener('animationend', () => {
		const chunkies = document.getElementsByClassName('chunky');

		for (let i = 0; i < chunkies.length; i++) {
			
			/*
			chunkies[i].classList.add('grey');
			chunkies[i].classList.remove('chunky');
			*/

			chunkies[i].style.backgroundImage = 'unset';
			chunkies[i].children[0].style.display = 'table-cell';
		}
	});
}

function sleep(seconds) 
{
  var e = new Date().getTime() + (seconds * 1000);
  while (new Date().getTime() <= e) {}
}

function announceLong(str) {
	announceEl.textContent = str;
	announceEl.classList.add('long');
}

function announceShort(str) {
	announceEl.textContent = str;
	announceEl.classList.add('short');
}

function initOverlay() {
	overlayEl = document.getElementById('overlay');
	overlayEl.addEventListener('animationend', (event) => {
		overlayEl.classList.remove('animate__animated');
		overlayEl.classList.remove('animate__slideInUpp');
		overlayEl.classList.remove('animate__slideOutDownn');

		if (event.animationName == 'slideInUpp') {
			overlayEl.style.visibility = 'unset';
			overlayEl.style.display = 'block';
		}
		if (event.animationName == 'slideOutDownn') {
			overlayEl.style.visibility = 'hidden';
			//overlayEl.style.display = 'none';
		}
	});
}

function initAnnounce() {
	announceEl =  document.getElementById('announce');
	announceEl.addEventListener('animationend', (event) => {
		announceEl.classList.remove('long');
		announceEl.classList.remove('short');

		if (gameOver) { //TODO: condition
			showOverlay();
		}
	});
}

function showOverlay() {
	if (!overlayEl.style.visibility || overlayEl.style.visibility == 'hidden') {
		overlayEl.classList.add('animate__slideInUpp', 'animate__animated');
	}
}

function closeOverlay() {
	if (overlayEl.style.visibility != 'hidden') {
		overlayEl.classList.add('animate__slideOutDownn', 'animate__animated');
		
	}
}

function updateStats(isWin) {
	pastScores[guessCount+1] = (pastScores[guessCount+1] || 0) + 1;
	if (isWin) {
		if (lastWin + 1 == gameNum) {
			currentStreak++;
		} else {
			currentStreak = 1;
		}
		maxStreak = Math.max(currentStreak, maxStreak);

		lastWin = gameNum;
		wins++;
	} else {
		losses++;
		currentStreak = 0;
	}

	localStorage.setItem('pastScores', JSON.stringify(pastScores));
	localStorage.setItem('lastWin', lastWin);
	localStorage.setItem('wins', wins);
	localStorage.setItem('losses', losses);
	localStorage.setItem('currentStreak', currentStreak);
	localStorage.setItem('maxStreak', maxStreak);	
	localStorage.setItem('lifetimeChunkies', lifetimeChunkies);	
}

function renderStats() {
	// update the displayed stats.
	const numEls = document.getElementsByClassName('num');
	// played
	numEls[0].textContent = (wins + losses);
	// win %
	numEls[1].textContent = Math.round((wins * 100 / (wins + losses)) || 0);
	// current streak
	numEls[2].textContent = currentStreak;
	// max streak
	numEls[3].textContent = maxStreak;
	// max streak
	numEls[4].textContent = lifetimeChunkies;


	if (!pastScores) {
		return;
	}

	let maxScore = 0;
	for (let i = 1; i < pastScores.length; i++) {
		if (pastScores[i] > maxScore) {
			maxScore = pastScores[i];
		}
	}

	const lineEls = document.getElementsByClassName('line');
	for (let i = 0; i < lineEls.length; i++) {
		lineEls[i].style.width = (pastScores[i+1] * 90 / maxScore) + '%';
		lineEls[i].children[0].textContent = pastScores[i+1] || '0';
		/*	
		if (alreadyPlayed && i == guessCount) {
			lineEls[i].style.background = '#6aaa64';
		}
		*/
	}
}

function toClipboard() {
	console.log('to clipboard');
	if (!gameOver) {
		announceLong('You can\'t share until you finish the game!');
		return;
	}

	let str = '';
	for (let i = 0; i < scores.length; i++) {
		for (let j = 0; j < scores[i].length; j++) {
			const score = scores[i][j];
			if (score == 0) {
				str += '⬜';
			} else if (score == 1) {
				str += '🟨';
			} else if (score == 2) {
				str += '🟩';
			} else if (score == 3) {
				str += '👹';
			}
		}
		str += '\n';
	}
	const shareString = 'I Think You Should Leavle ' + gameNum + ' ' + 
		((word == answer.join('') || word == '') ? guessCount : 'X') + '/6\n' + str
		+ 'itysl.com';

	try {
      share(shareString);
    } catch(err) {
    }
    copyToClipboard(shareString);
	announceShort('Result copied to clipboard!');

}

const share = async (text) => {
  const data = {
  	title: '',
    text: text,
  };
  try {
    await navigator.share(data);
  } catch (err) {
  	// document.getElementById('fine-print').textContent = err.name + ',' + err.message;
    // console.error(err.name, err.message);
    // throw new Error(err);
  }
};


function datediff(first, second) {
    return Math.floor((second-first)/(1000*60*60*24));
}

function copyToClipboard(text) {
    const clipEl = document.getElementById('clipboard');
    clipEl.value = text;
    clipEl.select();
    document.execCommand('copy');
}