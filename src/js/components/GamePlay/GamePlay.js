import calcTileType from '../../utils/calcTileType';
import Modal from '../Modal/Modal';

import './game-play.css';

export default class GamePlay {
  constructor(boardSize) {
    this.boardSize = boardSize;
    this.container = null;
    this.boardEl = null;
    this.cells = [];
    this.cellClickListeners = [];
    this.cellEnterListeners = [];
    this.cellLeaveListeners = [];
    this.isModal = false;
    this.missCounter = 0;
    this.maxMisses = 5;
    this.gameActive = true;

    this.initModalListener();
  }

  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }
    this.container = container;
  }

  initModalListener() {
    document.addEventListener('click', (e) => {
      if (
        e.target.dataset.handler === 'modalHandlerCancel'
        && this.currentModal
      ) {
        this.currentModal.hide();
        this.isModal = false;
      }
    });
  }

  drawUi(theme) {
    this.checkBinding();

    this.container.innerHTML = `
      <div class="board-container">
        <div data-id="board" class="board"></div>
      </div>
    `;

    this.boardEl = this.container.querySelector('[data-id=board]');

    this.boardEl.classList.add(theme);
    for (let i = 0; i < this.boardSize ** 2; i += 1) {
      const cellEl = document.createElement('div');
      cellEl.classList.add(
        'cell',
        'map-tile',
        `map-tile-${calcTileType(i, this.boardSize)}`,
      );
      cellEl.addEventListener('mouseenter', (event) => this.onCellEnter(event));
      cellEl.addEventListener('mouseleave', (event) => this.onCellLeave(event));
      cellEl.addEventListener('click', (event) => this.onCellClick(event));
      this.boardEl.append(cellEl);
    }

    this.cells = Array.from(this.boardEl.children);
  }

  redrawPositions(position) {
    if (!this.gameActive) {
      return;
    }

    for (const cell of this.cells) {
      cell.innerHTML = '';
    }
    if (position !== undefined && position >= 0 && position < this.cells.length) {
      const cellEl = this.boardEl.children[position];
      const charEl = document.createElement('div');
      charEl.classList.add('character', 'generic');

      cellEl.append(charEl);
    }
  }

  addCellEnterListener(callback) {
    this.cellEnterListeners.push(callback);
  }

  addCellLeaveListener(callback) {
    this.cellLeaveListeners.push(callback);
  }

  addCellClickListener(callback) {
    this.cellClickListeners.push(callback);
  }

  onCellEnter(event) {
    event.preventDefault();
    const index = this.cells.indexOf(event.currentTarget);
    this.cellEnterListeners.forEach((o) => o.call(null, index));
  }

  onCellLeave(event) {
    event.preventDefault();
    const index = this.cells.indexOf(event.currentTarget);
    this.cellLeaveListeners.forEach((o) => o.call(null, index));
  }

  onCellClick(event) {
    const index = this.cells.indexOf(event.currentTarget);
    this.cellClickListeners.forEach((o) => o.call(null, index));
    this.missCounter = 0;
  }

  selectCell(index, color = 'yellow') {
    this.deselectCell(index);
    this.cells[index].classList.add('selected', `selected-${color}`);
  }

  deselectCell(index) {
    const cell = this.cells[index];
    cell.classList.remove(
      ...Array.from(cell.classList).filter((o) => o.startsWith('selected')),
    );
  }

  hideCellTooltip(index) {
    this.cells[index].title = '';
  }

  setCursor(cursor) {
    this.boardEl.style.cursor = cursor;
  }

  checkBinding() {
    if (this.container === null) {
      throw new Error('GamePlay not bind to DOM');
    }
  }

  showModalMessage(message, unicode) {
    if (!this.isModal) return;
      this.isModal = true;
      this.gameActive = false;
      this.showModal(message, unicode);
  }

  showModal(message, unicode) {
    const modal = new Modal({
      title: message,
      content: `&#${unicode}`,
      footerButtons: [
        {
          class: 'btn btn__cancel',
          text: 'Close',
          handler: 'modalHandlerCancel',
        },
        {
          class: 'btn btn__confirm',
          text: 'Новая игра',
          handler: 'modalHandlerConfirm',
        },
      ],
    });

    this.currentModal = modal;

    modal.show();

    document.querySelector('.btn__confirm').addEventListener('click', () => {
      this.resetGame();
      modal.hide();
      if (this.onRestart) this.onRestart();
    });
  }

  resetGame() {
    this.missCounter = 0;
    this.gameActive = true;
    for (const cell of this.cells) {
      cell.innerHTML = '';
    }
    this.isModal = false;
    if (this.currentModal) {
      this.currentModal.hide();
      this.currentModal = null;
    }
  }
}
