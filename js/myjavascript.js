
const createdPlayers = document.getElementById('created-players');
const createdPlayersTable = document.querySelector('tbody');
const diceContainer = document.querySelector('#dice-container');
const emptyNameError = document.getElementById('error-empty-name');
const minPlayersError = document.getElementById('error-min-players');
const throwButton = document.querySelector('button#throw-dice');
const stopButton = document.querySelector('button#stop-throwing');
const gameLog = document.querySelector('#game-log-box div');

const game = {
    playerCounter: 0,
    numberOfDice: 6,
    currentPlayer: '', 
    playersScore: {},
    startGame: function() {
        const startGameView = document.getElementById('game-initialization').children[0];
        const createPlayersView = document.getElementById('add-players-box').children[0];
        let opacity = 1;

        const interval = setInterval(function() {
            if (opacity > 0) {
                opacity -= 0.05;
                startGameView.style.opacity = opacity;
            } else {
                clearInterval(interval);
                startGameView.classList.add('not-displayed');
                createPlayersView.classList.remove('not-displayed');
            }
        }, 50);
    },
    addPlayer: function() {
        minPlayersError.classList.add('not-displayed');

        const playerToAdd = document.querySelector('#add-player input').value.trim();

        if (playerToAdd === '') {
            emptyNameError.classList.remove('not-displayed');
        } else {
            emptyNameError.classList.add('not-displayed');
            this.playersScore[playerToAdd] = 0;

            const newPlayer = document.createElement('div');

            newPlayer.innerHTML = `
                <p>${playerToAdd}</p>
                <button class="delete-player">
                    <i class="fa-solid fa-trash-can fa-xl"></i>
                </button>
            `
            createdPlayers.appendChild(newPlayer);

            const newPlayerTable = document.createElement('tr');

            newPlayerTable.setAttribute('id', `player-${playerToAdd}`);
            newPlayerTable.innerHTML = `
                <td>${++this.playerCounter}</td>
                <td>${playerToAdd}</td>
                <td>0</td>
            `
            createdPlayersTable.appendChild(newPlayerTable);

            document.querySelector('#add-player input').value = '';
        }        
    },
    deletePlayer: function(event) { 
        const deleteButton = event.target.closest('.delete-player');
        const playerName = deleteButton.previousElementSibling.innerHTML;
        const playerToDelete = document.getElementById(`player-${playerName}`);
        const crtNo = Number(playerToDelete.firstElementChild.textContent);

        let currentElement = playerToDelete.nextElementSibling;

        for (let i = 0; i < this.playerCounter - crtNo ; i++) {
            currentElement.firstElementChild.textContent -= 1;
            currentElement = currentElement.nextElementSibling;
        }

        deleteButton.parentElement.remove();
        playerToDelete.remove();
        delete this.playersScore[playerName];
        this.playerCounter--;
    },
    playGame: function() {
        emptyNameError.classList.add('not-displayed');

        this.currentPlayer = Object.keys(this.playersScore)[0];

        const noOfPlayers = createdPlayers.children.length;

        if (noOfPlayers < 2) {
            minPlayersError.classList.remove('not-displayed');
        } else {
            minPlayersError.classList.add('not-displayed');

            const firstPlayer = document.querySelector('tr:nth-child(2)');
            const createPlayersView = document.getElementById('add-players-box').children[0];
            const gameView = document.getElementById('game');
            let opacity = 1;

            firstPlayer.classList.add('bordered');

            const interval = setInterval(function() {
                if (opacity > 0) {
                    opacity -= 0.05;
                    createPlayersView.style.opacity = opacity;
                } else {
                    clearInterval(interval);
                    createPlayersView.classList.add('not-displayed');
                    gameView.classList.remove('not-displayed');
                }
            }, 50);
        }
    },
    createDice: function(number) {
        const dotPositionMatrix = {
            1: [
                [50, 50]
            ],
            2: [
                [20, 20],
                [80, 80]
            ],
            3: [
                [20, 20],
                [50, 50],
                [80, 80]
            ],
            4: [
                [20, 20],
                [20, 80],
                [80, 20],
                [80, 80]
            ],
            5: [
                [20, 20],
                [20, 80],
                [50, 50],
                [80, 20],
                [80, 80]
            ],
            6: [
                [20, 20],
                [20, 80],
                [50, 20],
                [50, 80],
                [80, 20],
                [80, 80]
            ]
        }

        const dice = document.createElement('div');

        dice.classList.add('dice', 'reroll');

        for (let dotPosition of dotPositionMatrix[number]) {
            const dot = document.createElement('div');

            dot.classList.add('dice-dot');
            dot.style.setProperty('--top', dotPosition[0] + '%');
            dot.style.setProperty('--left', dotPosition[1] + '%');
            dice.appendChild(dot);
        }

        return dice;
    },
    diceThrow: function(diceContainer, numberOfDice) {
        const diceToRoll = Array.from(document.querySelectorAll('.reroll'));

        diceToRoll.forEach( dice => dice.remove());

        for (let i = 0; i < numberOfDice; i++) {
            const random = Math.ceil((Math.random() * 6));
            const dice = this.createDice(random);

            diceContainer.appendChild(dice);
        }
    },
    calculateScore: function() {
        let currentScore = document.querySelector('#current-score-container span');
        let currentDiceScore = 0;
        const rolledDice = document.querySelectorAll('.reroll');
        const diceArr = [];
        const diceFrequency = {
            10: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0
        }
        const currentPlayerScore = this.playersScore[this.currentPlayer];
        const isInThreshold = this.thresholdCheck(currentPlayerScore);
        const message = document.createElement('p');

        stopButton.disabled = false;
        stopButton.classList.remove('disabled');

        // dice points
        for (let i = 0; i < rolledDice.length; i++) {
            const diceValue = rolledDice[i].childElementCount;

            switch (diceValue) {
                case 1: 
                    diceArr[i] = diceValue * 10;
                    rolledDice[i].classList.remove('reroll');
                    rolledDice[i].style.cssText = `
                        background-color: lightgray;
                        opacity: 0.9;
                    `;
                    diceFrequency[10] += 1;
                    break; 
                case 5:
                    diceArr[i] = diceValue;
                    rolledDice[i].classList.remove('reroll');
                    rolledDice[i].style.cssText = `
                        background-color: lightgray;
                        opacity: 0.9;
                    `;
                    diceFrequency[5] += 1;
                    break; 
                case 2:
                case 3:
                case 4:
                case 6:
                    diceArr[i] = diceValue;
                    diceFrequency[diceValue] += 1;
            }
        }

        // points for multiple dice of the same type
        for (let dice in diceFrequency) {
            if (diceFrequency[dice] > 2) {
                currentDiceScore = currentDiceScore + dice * 10 * Math.pow(2, diceFrequency[dice] - 3);

                for (let i = 0; i < diceArr.length; i++) {
                    if (diceArr[i] === Number(dice)) {
                        rolledDice[i].classList.remove('reroll');
                        rolledDice[i].style.cssText = `
                            background-color: lightgray;
                            opacity: 0.9;
                        `;
                    }
                }
            } else {
                if (dice === '10' || dice === '5') {
                    currentDiceScore = currentDiceScore + dice * diceFrequency[dice];
                }
            }
        }

        // adjust the number of dice left to be thrown
        // check if all dice thrown were points, so to refresh dice number
        this.numberOfDice = document.querySelectorAll('.reroll').length;
        if (this.numberOfDice === 0) {
            this.numberOfDice = 6;
            Array.from(document.querySelectorAll('.dice')).forEach( dice => dice.classList.add('reroll'));
        }

        // check if the player threw 0 points
        if (!currentDiceScore) {
            throwButton.setAttribute('disabled', true);
            throwButton.classList.add('disabled');

            stopButton.disabled = false;
            stopButton.classList.remove('disabled');

            currentScore.textContent = 0;

            if (this.numberOfDice === 6) {
                this.showMessage('zbarci');
            }
        }

        // adjust the player's score
        currentScore.textContent = Number(currentScore.textContent) + currentDiceScore;

        const liveScore = this.liveScoreAndSurpassedOpp().score;

        // check if the player has left the threshold
        if (isInThreshold) {
            const thresholdExit = currentPlayerScore === 0 ? 100 : Math.ceil(currentPlayerScore / 100) * 100;

            if (currentDiceScore) {
                stopButton.disabled = true;
                stopButton.classList.add('disabled');
            }
            
            if (liveScore >= thresholdExit) {
                stopButton.disabled = false;
                stopButton.classList.remove('disabled');
            }
        }

        if (liveScore === 1000) {
            this.showMessage('win');

            throwButton.setAttribute('disabled', true);
            throwButton.classList.add('disabled');

            stopButton.disabled = false;
            stopButton.classList.remove('disabled');
        } else if (liveScore > 1000) {
            this.showMessage('exceeded');

            throwButton.setAttribute('disabled', true);
            throwButton.classList.add('disabled');

            stopButton.disabled = false;
            stopButton.classList.remove('disabled');
        }
    },
    thresholdCheck: function(playerScore) {
        switch (true) {
            case playerScore === 0:
            case playerScore > 199 && playerScore < 300:
            case playerScore > 699 && playerScore < 800:
                return true;
            default:
                return false;
        }
    },
    specialThresholdCheck: function(playerScore) {
        switch (true) {
            case playerScore > 199 && playerScore < 300:
            case playerScore > 699 && playerScore < 800:
            case playerScore > 899:
                return true;
            default:
                return false;
        }
    },
    nextPlayer: function() {
        const currentScore = document.querySelector('#current-score-container span');
        const currentPlayerRow = document.querySelector(`#player-${this.currentPlayer}`);
        const crtNo = Number(currentPlayerRow.firstElementChild.textContent);
        let nextRow = '';
        let nextPlayer = '';

        currentPlayerRow.classList.remove('bordered');

        if (crtNo === this.playerCounter) {
            nextRow = document.querySelector('tr:nth-child(2)');
        } else {
            nextRow = currentPlayerRow.nextElementSibling;
        }

        nextPlayer = nextRow.getAttribute('id').slice(7);
        nextRow.classList.add('bordered');
        this.currentPlayer = nextPlayer;
        this.numberOfDice = 6;

        throwButton.disabled = false;
        throwButton.classList.remove('disabled');

        stopButton.setAttribute('disabled', true);
        stopButton.classList.add('disabled');

        currentScore.textContent = 0;
        diceContainer.innerHTML = '';
    },
    stopTurn: function() {
        const currentPlayerScore = this.playersScore[this.currentPlayer];
        const thresholdExit = Math.ceil(currentPlayerScore / 100) * 100;
        let liveScore = this.liveScoreAndSurpassedOpp().score;
        let surpassedPlayers = this.liveScoreAndSurpassedOpp().opponents;

        console.log(this.playersScore);

        if (liveScore > 1000) {
            liveScore = currentPlayerScore;
            this.nextPlayer();
        } else if (liveScore === 1000) {
            this.endGame();
        } else {
            // Display the score change for opponents, in case any was surpassed 
            surpassedPlayers.forEach( opponent => {
                const opponentPreviousScore = this.playersScore[opponent];
                
                this.playersScore[opponent] -= 50;
                this.showMessage('surpassed', opponent);

                if (this.playersScore[opponent] < 100) {
                    this.playersScore[opponent] = 0;
                    document.querySelector(`tr#player-${opponent}`).lastElementChild.textContent = 0;
                    this.showMessage('zero', opponent);
                } else if (this.thresholdCheck(this.playersScore[opponent]) && !this.specialThresholdCheck(opponentPreviousScore)) {
                    this.showMessage('back-in-threshold', opponent);
                }

                document.querySelector(`tr#player-${opponent}`).lastElementChild.textContent = this.playersScore[opponent];
            });

            if (!(this.numberOfDice === 6 && Number(document.querySelector('#current-score-container span').textContent) === 0)) {
                this.showMessage(liveScore - currentPlayerScore); // show this message only when the throw was not a Zbarci
            }
            
            if (this.thresholdCheck(liveScore) && liveScore && (!this.specialThresholdCheck(currentPlayerScore) || liveScore > thresholdExit)) {
                this.showMessage('threshold');
            }
            
            this.playersScore[this.currentPlayer] = liveScore;
            document.querySelector(`tr#player-${this.currentPlayer}`).lastElementChild.textContent = liveScore;
            console.log(surpassedPlayers);
            console.log(this.playersScore);
            this.nextPlayer();
        }
    },
    showMessage: function(action, opponent) {
        const message = document.createElement('p');

        switch (true) {
            case action === 'zbarci':
                message.textContent = `${this.currentPlayer} threw a Zb\u00E2rci!`;
                break;
            case action === 'threshold':
                message.textContent = `${this.currentPlayer} entered the threshold`;
                break;
            case action === 'back-in-threshold':
                message.textContent = `${opponent} entered the threshold`; 
                break;
            case action === `win`:
                message.textContent = `${this.currentPlayer} won the game!`;
                break;
            case action === 'exceeded':
                message.textContent = `${this.currentPlayer} exceeded 1000 points!`;
                break;
            case action === 'surpassed':
                message.textContent = `${this.currentPlayer} (+50 points) surpassed ${opponent} (-50 points)`; 
                break;
            case action === 'zero':
                message.textContent = `${opponent} must start from 0 again!`; 
                break;
            case typeof(action) === 'number':
                message.textContent = `${this.currentPlayer} scored ${action} points`; 
        }

        gameLog.appendChild(message);
    },
    liveScoreAndSurpassedOpp: function() {
        const currentScore = document.querySelector('#current-score-container span');
        const playersScoreAscending = {};
        let liveScore = Number(currentScore.textContent) + this.playersScore[this.currentPlayer];
        let surpassedPlayers = [];
        let arrOfKeys = Object.keys(this.playersScore);
        
        // populate a new object containing the same keys, sorted in ascending order by their values (players' scores)
        arrOfKeys.sort( (a, b) => this.playersScore[a] - this.playersScore[b]);
        arrOfKeys.forEach( key => playersScoreAscending[key] = this.playersScore[key]);

        // check if the player has surpassed any opponent. If yes, adjust the player's score
        for (let key in playersScoreAscending) { // key is the name of the opponent
            if (key !== this.currentPlayer && this.playersScore[this.currentPlayer] < this.playersScore[key] && liveScore >= this.playersScore[key]) {
                let opponentScore = this.playersScore[key];
                const thresholdExit = Math.ceil(opponentScore / 100) * 100;

                if (!this.specialThresholdCheck(opponentScore) || (this.specialThresholdCheck(opponentScore) && liveScore >= thresholdExit)) {
                    liveScore += 50;
                    surpassedPlayers.push(key);
                }
            }
        }

        return {score: liveScore, opponents: surpassedPlayers};
    },
    endGame: function() {
        const gameView = document.getElementById('game');
        const winnerView = document.getElementById('winner');
        let opacity = 1;

        document.querySelector('#winner-box h4').textContent = this.currentPlayer;

        const interval = setInterval(function() {
            if (opacity > 0) {
                opacity -= 0.05;
                gameView.style.opacity = opacity;
            } else {
                clearInterval(interval);
                gameView.classList.add('not-displayed');
                winnerView.classList.remove('not-displayed');
            }
        }, 50);
    }
}

document.querySelector('button#start-game').addEventListener('click', function() {
    game.startGame();
});

document.querySelector('#add-player button').addEventListener('click', function() {
    game.addPlayer();
});

document.querySelector('#add-player input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        game.addPlayer();
    }
});

createdPlayers.addEventListener('click', function(event) {
    game.deletePlayer(event);
});

document.querySelector('#play-button-box button').addEventListener('click', function() {
    game.playGame();
});

throwButton.addEventListener('click', function() {
    throwButton.disabled = true;
    throwButton.classList.add('disabled');

    stopButton.disabled = true;
    stopButton.classList.add('disabled');

    const interval = setInterval( () => {
        game.diceThrow(diceContainer, game.numberOfDice);
    }, 50);

    setTimeout( () => {
        clearInterval(interval);

        throwButton.disabled = false;
        throwButton.classList.remove('disabled');

        game.calculateScore();
    }, 1200);
});

stopButton.addEventListener('click', function() {
    game.stopTurn();
});






