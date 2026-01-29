/*-------------------------------- Constants --------------------------------*/
const operations = ['+', '-', '*', '/'];
const minRandomNum = 1;
const maxRandomNum = 50;
let startTime;

/*---------------------------- Variables (state) ----------------------------*/
const gameState = {
    target: 0,
    time: 0,
    moves: 0,
    status: "playing",
    randomNumArr: [],
    level: [6, 8, 10]
};

const numBoardButtonVis = {
    visible: [], //true if visible
};

const playerInputs = {
  numbers: [],  //Store { idx, value }
  operation: null, 
};

const moveHistory = {
  moves: []  
};

/*------------------------ Cached Element References ------------------------*/
const targetNumber = document.querySelector("#targetNum");
const numberBoard = document.querySelector(".num-board");
const numberButtons = document.querySelectorAll(".btn-number");
const operatorBoard = document.querySelector(".operator-board");
const operatorButtons = document.querySelectorAll(".btn-operator");
const timeCount = document.querySelector("#time")
const movesCount = document.querySelector("#moves")
const historyBoard = document.querySelector(".history-board");
const startNewGame = document.querySelector("#startNewGame");
const winMessage = document.querySelector(".win-message");
const totalTime = document.querySelector("#total-time");
const totalMoves = document.querySelector("#total-moves");
const instructionsBtn = document.querySelector("#viewInstructions");
const instructions = document.querySelector("#instructions");

/*-------------------------------- Functions --------------------------------*/
init();
render();

function init() {
    gameState.time = 0;
    gameState.moves = 0;
    gameState.status = 'playing';
    moveHistory.moves = [];
    playerInputs.numbers = [];
    playerInputs.operation = null;
    startTime = Date.now();
    //Initialize game board
    gameState.randomNumArr = generateRandomNumber(6, 1);
    gameState.target = generateTarget(gameState.randomNumArr, 5)
    //Initialize board state 
    numBoardButtonVis.visible = new Array(gameState.randomNumArr.length).fill(true);
    //clear history
    const historyEls = historyBoard.querySelectorAll(".history-move");
    historyEls.forEach(el => el.remove())
    // update UI    
    render();
    countTime();    
}

function render() {
    //Update game status
    movesCount.textContent = gameState.moves;
    targetNumber.textContent = gameState.target;
    //Update number button in game board
    numberButtons.forEach((btn, i) => {
        btn.dataset.idx = i;
        btn.textContent = gameState.randomNumArr[i];
        if (!numBoardButtonVis.visible[i]) {
            btn.setAttribute("hidden", "hidden")
        } else {
            btn.removeAttribute("hidden");
        }
    })    
    //Update win message UI
    if (gameState.status === 'win') {
        totalTime.textContent = gameState.time;
        totalMoves.textContent = gameState.moves;
        winMessage.classList.add("show");
        startNewGame.removeAttribute("hidden");
    } else {
        winMessage.classList.remove("show");
        startNewGame.setAttribute("hidden", "hidden")
    }
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

function randomOperation(operations) {
    let idx = Math.floor(Math.random() * operations.length);
    return operations[idx];
}

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

function generateTarget(randomNumsArr, maxSelectNum) {
    const availableNums = [...randomNumsArr];
    const pickedNums = [];
    
    while (pickedNums.length < maxSelectNum && availableNums.length > 0) {
        let idx = Math.floor(Math.random() * availableNums.length);
        pickedNums.push(availableNums.splice(idx, 1)[0]);
    }

    // Group picked number as single or pair oepration
    const interResult = [];
    for (let i = 0; i < pickedNums.length; ) {
        let usePair = (Math.random() >= 0.5) && (i + 1 < pickedNums.length);
        if (usePair) {
            //Swapping to ensure the result is positive
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

function solveEquation() {
    const [a, b] = playerInputs.numbers;
    const result = calculate(playerInputs.operation, a.value, b.value)

    const move = {
        aIdx: a.idx,
        bIdx: b.idx,
        aVal: a.value,
        bVal: b.value,
        result: result,
        operation: playerInputs.operation,
    };

    moveHistory.moves.push(move);

    // Update game states
    gameState.randomNumArr[a.idx] = result;
    gameState.moves += 1;
    
    // Update button visibility
    numBoardButtonVis.visible[b.idx] = false;
    // Update move history
    updateHistoryEl(`= ${result}`);
    createUndoButton(move);
    
    // Reset player input
    playerInputs.numbers = [];
    playerInputs.operation = null;
    
    // Handle win
    if (result === gameState.target) {
        gameState.status = 'win';
    }
    render();
}

function undoMove(move, historyLine) {
    gameState.randomNumArr[move.aIdx] = move.aVal;
    numBoardButtonVis.visible[move.bIdx] = true;
    gameState.moves -= 1;

    // Remove history element
    moveHistory.moves.pop();
    deleteHistoryEl();

    render();    
}

function createHistoryElement(txt) {
    //Hide previous history element undo button
    const prevHistoryEl = historyBoard.firstElementChild;
    if (prevHistoryEl) {
        const prevUndoBtn = prevHistoryEl.querySelector('button');
        if (prevUndoBtn) {
            prevUndoBtn.hidden = true;
        }
    }

    const newHistoryEl = document.createElement("div");
    newHistoryEl.className = "history-move";

    const p = document.createElement("p");
    p.textContent = txt;

    newHistoryEl.appendChild(p);
    historyBoard.prepend(newHistoryEl);
}

function updateHistoryEl(txt, action = 'append') {
    const historyEl = historyBoard.firstElementChild;
    if (!historyEl) {
        return;
    } else {
        if (action === 'append'){
            historyEl.querySelector("p").textContent += ` ${txt}`;
        } else if (action === 'remove'){
            historyEl.querySelector("p").textContent = historyEl.querySelector("p").textContent.replace(` ${txt}`, "");
        }
    }
}

function deleteHistoryEl() {
    const delHistoryEl = historyBoard.firstElementChild;
    delHistoryEl.remove();
    //Restore undo button
     const historyEl = historyBoard.firstElementChild;
    if (historyEl) {
        const undoBtn = historyEl.querySelector('button');
        undoBtn.hidden = false;
    }
}

function createUndoButton(move) {
    const historyEl = historyBoard.firstElementChild;
    const undoBtnEl = document.createElement("button");

    undoBtnEl.textContent = 'Undo';
    undoBtnEl.addEventListener('click', (evt) => {
        undoMove(move, historyEl);
    })
    historyEl.appendChild(undoBtnEl);
}

function resetSelectedButton() {
    const selectedBtn = document.querySelectorAll(".btn-number.selected, .btn-operator.selected");
    selectedBtn.forEach((btn) => {
        btn.classList.remove("selected");
    });
}

/*----------------------------- Event Listeners -----------------------------*/
numberBoard.addEventListener('click', (evt) => {
    if (!evt.target.classList.contains("btn-number")) {
        return;
    }
        
    const idx = Number(evt.target.dataset.idx);
    const value = Number(evt.target.textContent);

    //Toggle selection
    const exSelectedIdx = playerInputs.numbers.findIndex((num) => {
        return num.idx === idx;
    });
    if (exSelectedIdx !== -1) {
        if (playerInputs.numbers.length === 1) {
            playerInputs.numbers.splice(exSelectedIdx, 1);
            deleteHistoryEl();
            evt.target.classList.remove("selected");
            return;
        } else if (playerInputs.numbers.length === 2) {
            updateHistoryEl(value, 'remove');
            playerInputs.numbers.splice(exSelectedIdx, 1);
            evt.target.classList.remove("selected");
            return;
        }
    }

    //Player select first number
    if (playerInputs.numbers.length === 0) {
        evt.target.classList.add("selected");
        playerInputs.numbers.push({idx, value});
        createHistoryElement(value);
        return;
    }
    // Player select second number
    if (playerInputs.numbers.length === 1 && playerInputs.operation) {
        if (((playerInputs.operation === '-') && (playerInputs.numbers[0].value < value)) ||
        ((playerInputs.operation === '/') && (playerInputs.numbers[0].value < value) && (playerInputs.numbers[0].value % value !== 0))) {
            return;
        } else {
            evt.target.classList.add("selected");
            playerInputs.numbers.push({idx, value});
            updateHistoryEl(value);
            return;
        }
    }
    render();
});

operatorBoard.addEventListener('click', (evt) => {
    const id = evt.target.id;
    if (id === 'equal') {
        if (playerInputs.numbers.length !== 2 || !playerInputs.operation) {
            evt.target.classList.remove("selected");
            return;
        } else {
            solveEquation();
            resetSelectedButton();
            return;
        }
    }
    if (playerInputs.numbers.length === 1){
        if (!playerInputs.operation){
            switch (id) {
                case 'plus':
                    playerInputs.operation = '+';
                    break;
                case 'minus':
                    playerInputs.operation = '-';
                    break;
                case 'multiply':
                    playerInputs.operation = '*';
                    break;
                case 'divide':
                    playerInputs.operation = '/';
                    break;
            }
            evt.target.classList.add("selected");
            if (playerInputs.operation) {
                updateHistoryEl(playerInputs.operation);
            }
        } else {
            updateHistoryEl(playerInputs.operation, 'remove');
            playerInputs.operation = null;
            evt.target.classList.remove("selected");
            return;
        }
        if (playerInputs.operation) {
            return;
        }
    }
    render();
});


startNewGame.addEventListener('click', (evt) => {
    init();
})

instructionsBtn.addEventListener("click", (evt) => {
    instructions.hidden = !instructions.hidden;
    instructionsBtn.textContent = instructions.hidden ? "Show Instructions" : "Hide Instructions";
})