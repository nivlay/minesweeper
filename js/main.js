'use strict';
var MINE_IMG = '🦠';
var EMPTY_IMG = '';
var FLAGE_IMG = '🚩';
var gBoard;
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 };
var gTimerInterval;
var gDuration = 0;

function initGame() {
  if (!gGame.isOn) {
    gGame.isOn = true;
  }
  gTimerInterval = null;
  gBoard = getBoard();
  setMinesNegsCount(gBoard);
  renderBoard(gBoard);
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

  // for loop random index
  board[0][0].isMine = true;
  board[2][3].isMine = true;
  return board;
}

function renderBoard(board) {
  var strHTML = '<table border="1"><tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j];
      var cellImg;
      var isCellEmpty = false;
      if (cell.isMarked) {
        cellImg = FLAGE_IMG;
      }
      if (cell.isShown) {
        if (cell.isMine) {
          cellImg = MINE_IMG;
        } else if (cell.minesAroundCount !== 0) {
          cellImg = cell.minesAroundCount;
        } else {
          isCellEmpty = true;
        }
      } else if (!cell.isMarked) {
        cellImg = EMPTY_IMG;
      }
      var className = `cell cell${i}-${j} `;
      if (isCellEmpty) {
        className += 'cell-empty';
      }

      strHTML += `<td oncontextmenu="onRightClick(event,this,${i},${j})" onClick="cellClicked(this,${i},${j})" class="${className}">${cellImg}</td>`;
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
  // get mines count -- rename
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

function cellClicked(elCell, i, j) {
  if (!gGame.isOn) return;
  var cell = gBoard[i][j];
  if (!gTimerInterval) {
    gTimerInterval = createTimer();
  }
  if (!cell.isShown) {
    cell.isShown = true;
  }
  if (cell.isMine) {
    handleMine();
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    checkGameOver();
  }

  renderBoard(gBoard);
}

function onRightClick(ev, el, i, j) {
  ev.preventDefault();
  var cell = gBoard[i][j];
  cell.isMarked = !cell.isMarked;
  renderBoard(gBoard);
}

function handleMine() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
    }
  }
}

function checkGameOver() {
  var elH2 = document.querySelector('h2');
  elH2.style.display = 'block';
}

function resetGame() {
  clearInterval(gTimerInterval);
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
