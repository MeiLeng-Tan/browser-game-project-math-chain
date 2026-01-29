/*-------------------------------- Constants --------------------------------*/
const operations = ['+', '-', '*', '/'];
const minRandomNum = 1;
const maxRandomNum = 50;
let startTime;
/*---------------------------- Variables (state) ----------------------------*/
// Game states 
const gameState = {
    target: 0,
    time: 0,
    moves: 0,
    status: "playing",
    randomNumArr: [],
    level: [6, 8, 10]
};

const board = {
  buttons: [] // [{ idx, value, hidden }]
};

const playerInputs = {
  numbers: [],  // [{ idx, value }]
  operations: null, 
};

const moveHistory = {
  steps: []   // reversible actions
};


/*------------------------ Cached Element References ------------------------*/
const targetNumber = document.querySelector("#targetNum");
const numberBoard = document.querySelector(".num-board");
const numberButtons = document.querySelectorAll(".btn-number");
const operatorBoard = document.querySelector(".operator-board");
const timeCount = document.querySelector("#time")
const movesCount = document.querySelector("#moves")
const historyBoard = document.querySelector(".history-board");
const startNewGame = document.querySelector("#startNewGame");
const winMessage = document.querySelector(".win-message");
const totalTime = document.querySelector("#total-time");
const totalMoves = document.querySelector("#total-moves");

/*-------------------------------- Functions --------------------------------*/
init();
render();

function init() {
    //Initialize game state
    gameState.time = 0;
    gameState.moves = 0;
    gameState.status = 'playing';
    //Initialize history
    moveHistory.steps = [];
    //Initialize board state 
    board.buttons = [];
    //Initialize player input states
    playerInputs.nums = [];
    startTime = Date.now();
    timeCount.textContent = gameState.time;

    //Initialize random numbers array
    gameState.randomNumArr = generateRandomNumber(6, 1);
    //Generate target number from the random numbers array
    gameState.target = generateTarget(gameState.randomNumArr, 5)
    
    //Clear the number buttons
    numberButtons.forEach((btn, i) => {
        btn.dataset.idx = i;
        btn.textContent = gameState.randomNumArr[i];
        btn.removeAttribute("hidden");
    })

    movesCount.textContent = gameState.moves;
    targetNumber.textContent = gameState.target;
    startNewGame.setAttribute("hidden", "hidden");
    //clear history
    while (historyBoard.firstElementChild) {
        historyBoard.firstElementChild.remove();
    }
    //winMessage.setAttribute("hidden", "hidden")
    winMessage.classList.remove("show");
}

function render() {
    playerSelect();
    countTime();
}

function countTime() {
    if (gameState.status === 'win') return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    gameState.time = `${minutes}:${String(seconds).padStart(2, '0')}`;
    timeCount.textContent = gameState.time;
    requestAnimationFrame(countTime);    
}

/* Function to generate a random numbers array */
function generateRandomNumber(n, nDoubleDigit){
    const randomNums = [];
    let nDouble = 0;
    while (randomNums.length < n) {
        let randomNum = Math.floor(Math.random() * (maxRandomNum - minRandomNum) + minRandomNum);
        if (!randomNums.includes(randomNum)){
            if (randomNum>10) {
                if (nDouble < nDoubleDigit) {
                    randomNums.push(randomNum);
                    nDouble = nDouble + 1;
                } 
            } else {
                randomNums.push(randomNum);
            }
        }
    }
    return randomNums;
}

//function to pick random operations
function randomOperation(operations) {
    let idx = Math.floor(Math.random() * operations.length);
    return operations[idx];
}

//Function to get a valid operation
function getValidOperation(a, b){
    let operation = randomOperation(operations);
    while (operation === '/' && (a % b !== 0)) {
        operation = randomOperation(operations);
    }
    return operation;
}

function calculate(operation, a, b) {
    switch (operation) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            return a / b;
    }
}

/*Function to generate target numbers from the generated random numbers array. */
function generateTarget(randomNumsArr, nSelect) {
    //Pick nSelect random numbers
    const availableNums = [...randomNumsArr];
    const pickedNums = [];
    
    while (pickedNums.length < nSelect && availableNums.length > 0) {
        let idx = Math.floor(Math.random() * availableNums.length);
        pickedNums.push(availableNums.splice(idx, 1)[0]);
    }

    // Group picked number as single or pair oepration
    const interResult = [];
    for (let i = 0; i < pickedNums.length; ) {
        let usePair = (Math.random() >= 0.5) && (i + 1 < pickedNums.length);
        if (usePair) {
            //Swapping to ensure the number is positive
            if (pickedNums[i] < pickedNums[i + 1]) {
                let operation = getValidOperation(pickedNums[i + 1], pickedNums[i]);
                let result = calculate(operation, pickedNums[i + 1], pickedNums[i]);
                interResult.push(result);
                i += 2;
            } else {
                let operation = getValidOperation(pickedNums[i], pickedNums[i + 1]);
                let result = calculate(operation, pickedNums[i], pickedNums[i + 1]);
                interResult.push(result);
                i += 2;
            }
        } else {
            interResult.push(pickedNums[i]);
            i += 1;
        }
    }
    
    let target = interResult[0];
    for (let i = 1; i < interResult.length; i++) {
        if (target < interResult[i]) {
            let operation = getValidOperation(interResult[i], target);
            target = calculate(operation, interResult[i], target); 
        } else {
            let operation = getValidOperation(target, interResult[i]);
            target = calculate(operation, target, interResult[i]); 
        }
    }
    return target;
}

function handleWin() {
    gameState.status = 'win';
    totalTime.textContent = gameState.time;
    totalMoves.textContent = gameState.moves;
    winMessage.classList.add("show");
    startNewGame.removeAttribute("hidden");
}

function solveEquation() {
    const [a, b] = playerInputs.numbers;
    const result = calculate(playerInputs.operations, a.value, b.value)

    const move = {
        aIdx: a.idx,
        bIdx: b.idx,
        aVal: a.value,
        bVal: b.value,
        result: result,
        operation: playerInputs.operations,
    };

    moveHistory.steps.push(move);
    // Update number board
    updateNumberBoard(move);
    updateHistory(`= ${result}`);
    createUndoButton(move);

    playerInputs.numbers = [];
    playerInputs.operations = null;
    gameState.moves += 1;
    movesCount.textContent = gameState.moves;

    if (result === gameState.target) {
        handleWin();
    }
}

function updateNumberBoard(move) {
    //Update board
    const aBtn = numberButtons[move.aIdx];
    const bBtn = numberButtons[move.bIdx];

    aBtn.textContent = move.result;
    bBtn.setAttribute("hidden", "hidden");
}

function undoMove(move, historyLine) {
    const aBtn = numberButtons[move.aIdx];
    const bBtn = numberButtons[move.bIdx];
    //restore number board to initial value
    aBtn.textContent = move.aVal;
    bBtn.textContent = move.bVal;
    bBtn.removeAttribute("hidden");

    //Remove line from history
    moveHistory.steps.pop();
    deleteHistory();
    gameState.moves -= 1;
    movesCount.textContent = gameState.moves;
}

function createHistory(txt) {
    //Hide previous undo button
    const prevLine = historyBoard.firstElementChild;
    if (prevLine) {
        const prevUndo = prevLine.querySelector('button');
        prevUndo.hidden = true;
    }

    const newLine = document.createElement("div");
    newLine.className = "history-move";

    const p = document.createElement("p");
    p.textContent = txt;

    newLine.appendChild(p);
    historyBoard.prepend(newLine);
}

function updateHistory(txt, action = 'append') {
    const line = historyBoard.firstElementChild;
    if (!line) {
        return;
    } else {
        if (action === 'append'){
            line.querySelector("p").textContent += ` ${txt}`;
        } else if (action === 'remove'){
            console.log(txt)
            line.querySelector("p").textContent = line.querySelector("p").textContent.replace(` ${txt}`, "");
            console.log(line.querySelector("p").textContent)
        }
    }
}

function deleteHistory() {
    const history = historyBoard.firstElementChild;
    history.remove();
    //Restore undo button
     const prevLine = historyBoard.firstElementChild;
    if (prevLine) {
        const prevUndo = prevLine.querySelector('button');
        prevUndo.hidden = false;
    }
}

function createUndoButton(move) {
    const line = historyBoard.firstElementChild;
    const undoBtn = document.createElement("button");

    undoBtn.textContent = 'Undo';
    undoBtn.addEventListener('click', (evt) => {
        undoMove(move, line);
    })
    line.appendChild(undoBtn);
}

function resetSelectedButton() {
    const selectedBtn = document.querySelectorAll(".btn-number.selected, .btn-operator.selected");
    selectedBtn.forEach((btn) => {
        btn.classList.remove("selected");
    });
}

/*----------------------------- Event Listeners -----------------------------*/
//Select number
function playerSelect(){
    numberBoard.addEventListener('click', (evt) => {
        if (!evt.target.classList.contains("btn-number")) {
            return;
        }
        
        const idx = Number(evt.target.dataset.idx);
        const value = Number(evt.target.textContent);

        //Toggle selection
        const dupSelection = playerInputs.numbers.findIndex((num) => {
            return num.idx === idx;
        });
        if (dupSelection !== -1) {
            if (playerInputs.numbers.length === 1) {
                console.log('clear duplicates')
                playerInputs.numbers.splice(dupSelection, 1);
                deleteHistory();
                evt.target.classList.remove("selected");
                return;
            } else if (playerInputs.numbers.length === 2) {
                console.log('clear 2nd num');
                updateHistory(value, 'remove');
                playerInputs.numbers.splice(dupSelection, 1);
                evt.target.classList.remove("selected");
                return;
            }
        }

        //First number
        if (playerInputs.numbers.length === 0) {
            evt.target.classList.add("selected");
            playerInputs.numbers.push({idx, value});
            createHistory(value);
            return;
        }
        //Second number
        if (playerInputs.numbers.length === 1 && playerInputs.operations.length > 0) {
            if (((playerInputs.operations === '-') && (playerInputs.numbers[0].value < value)) ||
            ((playerInputs.operations === '/') && (playerInputs.numbers[0].value < value) && (playerInputs.numbers[0].value % value !== 0))) {
                console.log(playerInputs.numbers[0].value)
                return;
            } else {
                evt.target.classList.add("selected");
                playerInputs.numbers.push({idx, value});
                updateHistory(value);
                return;
            }
        }
    });

    //Select operator
    operatorBoard.addEventListener('click', (evt) => {
        const id = evt.target.id;
        if (id === 'equal') {
            if (playerInputs.numbers.length !== 2 || !playerInputs.operations) {
                evt.target.classList.remove("selected");
                return;
            } else {
                solveEquation();
                resetSelectedButton();
                return;
            }
        }
        if (playerInputs.numbers.length === 1){
            if (!playerInputs.operations){
                switch (id) {
                    case 'plus':
                        playerInputs.operations = '+';
                        break;
                    case 'minus':
                        playerInputs.operations = '-';
                        break;
                    case 'multiply':
                        playerInputs.operations = '*';
                        break;
                    case 'divide':
                        playerInputs.operations = '/';
                        break;
                }
                evt.target.classList.add("selected");
                if (playerInputs.operations) {
                    updateHistory(playerInputs.operations);
                }
            } else {
            updateHistory(playerInputs.operations, 'remove');
            playerInputs.operations = null;
            evt.target.classList.remove("selected");
            return;
            }
        if (playerInputs.operations) {
            return;
        }
    }
    })
}

startNewGame.addEventListener('click', (evt) => {
    init();
})