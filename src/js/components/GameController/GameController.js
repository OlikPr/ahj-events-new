import createPosition from '../../utils/createPosition';
import cursors from '../../cursors';
import ClickCounter from '../ClickCounter/ClickCounter';

export default class GameController {
  constructor(gamePlay) {
    this.gamePlay = gamePlay;
    this.indexSelect = null;
    this.clickCounter = null;
    this.currentGoblinPosition = null;
    this.onCellClick = this.onCellClick.bind(this);
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.isGameActive = true;
  }

  init() {
    this.events();
    this.gamePlay.drawUi('prairie');
    this.clickCounter = new ClickCounter(document.querySelector('#game-container'));
    this.gamePlay.onRestart = () => this.reset();
    this.showCharacter();
  }

  events() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
  }

  onCellClick(e) {
    this.reactOnClick(e);
  }

  onCellEnter(index) {
    this.gamePlay.setCursor(cursors.hammer);

    if (document.querySelector('.selected-generic')) {
      this.gamePlay.deselectCell(this.indexSelect);
    }

    this.gamePlay.selectCell(index);
    this.indexSelect = index;
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.pointer);
  }

  showCharacter() {
    if (this.timerId) {
    clearInterval(this.timerId);
    }
    this.timerId = setInterval(() => {
      if (!this.isGameActive) {
        clearInterval(this.timerId);
        return;
      } 
      if (this.currentGoblinPosition !== null) {
        this.clickCounter.incrementMiss();
        if (this.clickCounter.getMissCount() >= 5) {
          this.gamePlay.showModalMessage('Вы проиграли!', '129335');
          this.isGameActive = false;
          clearInterval(this.timerId);
          return;
        }
      }

      const position = createPosition(this.gamePlay.boardSize);
      this.currentGoblinPosition = position;
      this.gamePlay.redrawPositions(position);
    }, 1000);

    setTimeout(() => this.resetTimer(), 500000);
  }

  resetTimer() {
    clearInterval(this.timerId);
  }

  reactOnClick(e) {
    const boardCellClick = document.querySelectorAll('.cell')[e];
    const isGoblin = boardCellClick.querySelector('.generic');

    if (isGoblin) {
      this.clickCounter.incrementHit();
      this.currentGoblinPosition = null;
      this.resetTimer();
      const position = createPosition(this.gamePlay.boardSize);
      this.currentGoblinPosition = position;
      this.gamePlay.redrawPositions(position);
      this.showCharacter();

      if (this.clickCounter.getHitCount() >= 10) {
        this.gamePlay.showModalMessage(`You win! Your points are ${this.clickCounter.getHitCount()}`, '127881');
        this.reset();
      }
    } else {
      this.clickCounter.incrementMiss();
      if (this.clickCounter.getMissCount() >= 5) {
        this.gamePlay.showModalMessage('You lose!', '129335');
        this.reset();
      }
    }
  }

  reset() {
    this.isGameActive = true;
    this.clickCounter.reset();
    this.currentGoblinPosition = null;
    this.gamePlay.resetGame();
    this.showCharacter();
  }
}
