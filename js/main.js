'use strict';
var MINE_IMG = '🦠';
var EMPTY_IMG = '✔️';
var FLAGE_IMG = '🚩';
var gBoard;
var gLevel = { SIZE: 4, MINES: 2 };
var gTimerInterval;
var gDuration = 0;
var gGame;

function initGame() {
  gGame = { isOn: false, shownCount: 0, markedCount: 0 };
  if (!gGame.isOn) {
    gGame.isOn = true;
  }
  gTimerInterval = null;
  gBoard = getBoard();
  setMinesNegsCount(gBoard);
  renderBoard(gBoard);
  gDuration = 0;
  renderTimer();
}

function getBoard() {
  var board = createMat(gLevel.SIZE);
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
      board[i][j] = cell;
    }
  }
  getRandomMines(board);

  return board;
}

function getRandomMines(board) {
  for (var mines = 0; mines < gLevel.MINES; mines++) {
    var randomI = getRandomInt(0, board.length - 1);
    var randomJ = getRandomInt(0, board.length - 1);
    while (board[randomI][randomJ].isMine === true) {
      randomI = getRandomInt(0, board.length - 1);
      randomJ = getRandomInt(0, board.length - 1);
    }
    board[randomI][randomJ].isMine = true;
  }
}

function renderBoard(board) {
  var strHTML = '<table border="1"><tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[0].length; j++) {
      var className = `cell cell${i}-${j} `;
      strHTML += `<td oncontextmenu="onRightClick(event,${i},${j})" onClick="cellClicked(${i},${j})" class="${className}"></td>`;
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody></table>';

  var elContainer = document.querySelector('.board-container');
  elContainer.innerHTML = strHTML;
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      board[i][j].minesAroundCount = getMinesCount(board, i, j);
    }
  }
}

function getMinesCount(board, row, col) {
  var count = 0;

  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j >= board[0].length) continue;
      if (i === row && j === col) continue;
      if (board[i][j].isMine) count++;
    }
  }

  return count;
}

function cellClicked(i, j) {
  if (!gGame.isOn) return;
  var elH2 = document.querySelector('h2');
  var elScore = document.querySelector('.score');
  var cell = gBoard[i][j];
  var elBtn = document.querySelector('.emoji');
  if (!gTimerInterval) {
    createTimer();
  }
  if (!cell.isShown) {
    cell.isShown = true;
    if (!cell.isMine) {
      gGame.shownCount++;
      elScore.innerText = gGame.shownCount;
    }
  }
  if (cell.isMarked) {
    return;
  }
  if (cell.isMine) {
    handleMine();
    renderCell(i, j, MINE_IMG);
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    elBtn.innerHTML = '<button>😭</button>';
    elH2.style.display = 'block';
  } else if (cell.minesAroundCount > 0) {
    renderCell(i, j, cell.minesAroundCount);
    checkGameOver();
  } else if (cell.minesAroundCount === 0) {
    renderCell(i, j, EMPTY_IMG);
    checkGameOver();
  }
}

function onRightClick(ev, i, j) {
  ev.preventDefault();
  if (!gGame.isOn) return;
  if (!gTimerInterval) {
    createTimer();
  }
  var cell = gBoard[i][j];
  if (cell.isShown) return;
  if (!cell.isMarked) {
    cell.isMarked = true;
    gGame.markedCount++;
    renderCell(i, j, FLAGE_IMG);
  } else {
    cell.isMarked = false;
    gGame.markedCount--;
    renderCell(i, j, EMPTY_IMG);
  }
  checkGameOver();
}

function renderCell(i, j, value) {
  var elCell = document.querySelector(`.cell${i}-${j}`);
  if (value === MINE_IMG) {
    elCell.style.backgroundColor = 'red';
  } else {
    elCell.style.backgroundColor = '#ff0066';
  }
  elCell.innerText = value;
}

function handleMine() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) {
        gBoard[i][j].isShown = true;
        renderCell(i,j,MINE_IMG);
      }
    }
  }
}

function checkGameOver() {
  var elH2 = document.querySelector('h2');
  var elBtn = document.querySelector('.emoji');
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      // var cell = gBoard[i][j];
      console.log('markcount ' + gGame.markedCount + 'mines ' + gLevel.MINES);
      if (
        gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES
      ) {
        elH2.innerText = 'You are a winner!';
        elH2.style.display = 'block';
        elBtn.innerHTML = '<button>😎</button>';
        clearInterval(gTimerInterval);
      }
    }
  }
}

function resetGame() {
  var elH2 = document.querySelector('h2');
  var elBtn = document.querySelector('.emoji');
  var elScore = document.querySelector('.score');
  elH2.style.display = 'none';
  clearInterval(gTimerInterval);
  gTimerInterval = null;
  elBtn.innerHTML = '<button>😁</button>';
  elScore.innerText = 0;
  initGame();
}

function getDifficulty(elBtn) {
  if (elBtn.getAttribute('class') === 'difficulty beginner')
    gLevel = { SIZE: 4, MINES: 2 };
  if (elBtn.getAttribute('class') === 'difficulty medium')
    gLevel = { SIZE: 8, MINES: 12 };
  if (elBtn.getAttribute('class') === 'difficulty expert')
    gLevel = { SIZE: 12, MINES: 30 };
  clearInterval(gTimerInterval);
  gTimerInterval = null;
  initGame();
}

function createTimer() {
  gTimerInterval = setInterval(function () {
    gDuration++;
    renderTimer();
  }, 1000);
}

function renderTimer() {
  var elTimer = document.querySelector('.timer');
  elTimer.innerText = new Date(gDuration * 1000).toISOString().substr(11, 8);
}
