const { useState, useRef, useEffect } = React;

// --- BOARD LOGIC (Preserved perfectly, no UI code here) ---
class Board {
  static QUANTUM = 'quantum'; static COLLAPSE = 'collapse'; static CLASSICAL = 'classical';
  static PLAYERX = 'X'; static PLAYERO = 'O';
  static WIN_POSITIONS = [ [1,2,3], [4,5,6], [7,8,9], [1,4,7], [2,5,8], [3,6,9], [1,5,9], [3,5,7] ];

  constructor() { this.clear(); }

  clear() {
    this._board = Array.from({ length: 9 }, () => []);
    this._edges = Array.from({ length: 9 }, () => []);
    this._placed = 0; this._nextType = Board.QUANTUM;
    this._tictactoes = []; this._history = []; this._collapseStates = [];
  }

  board() { return this._board; }
  get(i) { return this._board[i - 1]; }
  placed() { return this._placed; }
  turn() { return this._placed % 2 ? Board.PLAYERO : Board.PLAYERX; }
  nextType() { return this._nextType; }
  gameOver() { return !this._nextType; }
  tictactoes() { return this._tictactoes; }

  scores() {
    if (!this.gameOver()) return null;
    const scores = { [Board.PLAYERX]: 0, [Board.PLAYERO]: 0 };
    this._tictactoes.forEach(t => { scores[t.player] += t.score; });
    return scores;
  }

  _canMove(move) {
    if (!move || move.type !== this._nextType) return false;
    const isQuantum = (c) => c && Array.isArray(this._board[c - 1]);
    if (move.type === Board.QUANTUM) {
      const [a, b] = move.cells; return isQuantum(a) && isQuantum(b) && a !== b;
    }
    if (move.type === Board.COLLAPSE) {
      return isQuantum(move.cells) && this._board[move.cells - 1].at(-1) === this._placed;
    }
    if (move.type === Board.CLASSICAL) return isQuantum(move.cells);
    return false;
  }

  move(moveObj) {
    if (!this._canMove(moveObj)) return null;
    this._history.push(moveObj); this._applyMove(moveObj);
    return moveObj;
  }

  undo() {
    const moveObj = this._history.pop();
    if (moveObj) this._unapplyMove(moveObj);
    return moveObj;
  }

  _countClassicalPieces() { return this._board.filter(cell => !Array.isArray(cell)).length; }

  _applyMove(move) {
    if (move.type === Board.QUANTUM) {
      const [a, b] = move.cells; this._placed++;
      if (this._reachable(a, b)) this._nextType = Board.COLLAPSE;
      this._board[a - 1].push(this._placed); this._board[b - 1].push(this._placed);
      this._edges[a - 1].push(b); this._edges[b - 1].push(a);
    } else if (move.type === Board.COLLAPSE) {
      this._collapseStates.push([...this._board.map(c => Array.isArray(c) ? [...c] : c)]); 
      this._collapseCell(this._placed, move.cells);
      this._nextType = this._countClassicalPieces() === 8 ? Board.CLASSICAL : Board.QUANTUM;
      this._updateGameStatus();
    } else if (move.type === Board.CLASSICAL) {
      this._placed++; this._board[move.cells - 1] = this._placed; this._updateGameStatus();
    }
  }

  _unapplyMove(move) {
    this._nextType = move.type; this._tictactoes = [];
    if (move.type === Board.QUANTUM) {
      const [a, b] = move.cells; this._placed--;
      this._board[a - 1].pop(); this._board[b - 1].pop();
      this._edges[a - 1].pop(); this._edges[b - 1].pop();
    } else if (move.type === Board.COLLAPSE) {
      this._board = this._collapseStates.pop();
    } else if (move.type === Board.CLASSICAL) {
      this._placed--; this._board[move.cells - 1] = [];
    }
  }

  _reachable(src, dest) {
    const visited = []; const edges = this._edges;
    const visit = (c) => { if (visited.includes(c)) return; visited.push(c); edges[c - 1].forEach(visit); };
    visit(src); return visited.includes(dest);
  }

  _collapseCell(piece, c) {
    const neighbors = this._edges[c - 1]; const cell = this._board[c - 1];
    if (!Array.isArray(cell)) return;
    this._board[c - 1] = piece;
    for (let i = 0; i < neighbors.length; ++i) this._collapseCell(cell[i], neighbors[i]);
  }

  _updateGameStatus() {
    const tictactoes = [];
    const isX = (c) => typeof c === 'number' && c % 2 === 1;
    const isO = (c) => typeof c === 'number' && c % 2 === 0;

    Board.WIN_POSITIONS.forEach((position) => {
      const pieces = position.map(pos => this.get(pos));
      let player = null;
      if (pieces.every(isX)) player = Board.PLAYERX;
      else if (pieces.every(isO)) player = Board.PLAYERO;
      if (player) tictactoes.push({ player, cells: position, pieces });
    });

    let minPiece = 9;
    tictactoes.forEach((t) => { const max = Math.max(...t.pieces); if (minPiece > max) minPiece = max; });
    tictactoes.forEach((t) => { t.score = minPiece === Math.max(...t.pieces) ? 2 : 1; });

    if (tictactoes.length || this._countClassicalPieces() === 9) this._nextType = null;
    this._tictactoes = tictactoes;
  }
}

// --- REACT COMPONENTS ---

const RulesModal = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="rules-content glass-panel">
      <h2>RULES OF ENGAGEMENT</h2>
      <div className="video-container">
        <video id="ai-rules-video" controls autoPlay>
          <source src="vid.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <ul>
        <li><strong>Quantum Moves:</strong> Place two entangled pieces in different squares per turn.</li>
        <li><strong>Cyclic Entanglement:</strong> Creating a closed loop of entangled pieces triggers a collapse!</li>
        <li><strong>The Collapse:</strong> The player who did NOT create the cycle chooses which piece stays.</li>
        <li><strong>Victory:</strong> The board collapses into 3 classical pieces in a row.</li>
      </ul>
      <button className="btn primary center-btn" onClick={onClose}>Acknowledge</button>
    </div>
  </div>
);

const Cell = ({ index, pieceData, onClick, halfMove, isCollapseHighlight, winHighlight }) => {
  
  // Render sub-components based on cell state
  const renderClassical = (num) => (
    <div className="classical">
      <div className={`piece ${num % 2 === 1 ? 'x' : 'o'}`}>
        <p className="move-text">{num}</p>
      </div>
    </div>
  );

  const renderQuantum = (num) => {
    const i = Math.floor((num - 1) / 3);
    const j = (num - 1) % 3;
    const style = { top: `${i * 33}%`, left: `${j * 33}%` };
    return (
      <div key={num} className="quantum" style={style}>
        <div className={`piece ${num % 2 === 1 ? 'x' : 'o'}`}>
          <p className="move-text">{num}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="cell" onClick={() => onClick(index)}>
      {isCollapseHighlight && <div className="highlight collapse"></div>}
      {winHighlight && <div className={`highlight ${winHighlight}`}></div>}
      
      {/* If array, render quantum. If number, render classical */}
      {Array.isArray(pieceData) ? pieceData.map(renderQuantum) : renderClassical(pieceData)}
      
      {/* Show the pending half-move if this cell was clicked */}
      {halfMove === index && renderQuantum(pieceData.length + 1 || 1)} 
    </div>
  );
};

const App = () => {
  const [screen, setScreen] = useState('start'); // 'start' or 'game'
  const [showRules, setShowRules] = useState(false);
  
  // Game State
  const boardRef = useRef(new Board());
  const [tick, setTick] = useState(0); // Used to force React re-render when Board class updates
  const [halfMove, setHalfMove] = useState(null);

  const board = boardRef.current;

  const handleCellClick = (c) => {
    const nextType = board.nextType();
    let move = null;

    if (nextType === Board.QUANTUM) {
      if (halfMove === null && Array.isArray(board.get(c))) {
        setHalfMove(c);
        return;
      } else if (halfMove === c) {
        setHalfMove(null);
        return;
      } else {
        move = { type: Board.QUANTUM, cells: [c, halfMove] };
      }
    } else if (nextType === Board.COLLAPSE) {
      move = { type: Board.COLLAPSE, cells: c };
    } else if (nextType === Board.CLASSICAL) {
      move = { type: Board.CLASSICAL, cells: c };
    }

    if (move && board.move(move)) {
      setHalfMove(null);
      setTick(t => t + 1); // Trigger re-render
    }
  };

  const undoMove = () => {
    if (halfMove) {
      setHalfMove(null);
    } else {
      board.undo();
      setTick(t => t + 1);
    }
  };

  const restartGame = () => {
    board.clear();
    setHalfMove(null);
    setTick(t => t + 1);
  };

  const getScoresString = () => {
    const scores = board.scores();
    if (!scores) return "";
    const formatScore = (val) => {
      const half = "\u00bd";
      if (val === 0) return "0";
      if (val === 1) return half;
      if (val === 2) return "1";
      if (val === 3) return `1${half}`;
      if (val === 4) return "2";
      return "";
    };
    return `${formatScore(scores[Board.PLAYERX])} \u2014 ${formatScore(scores[Board.PLAYERO])}`;
  };

  // Determine highlights for rendering
  const collapseHighlights = board.nextType() === Board.COLLAPSE 
    ? [1,2,3,4,5,6,7,8,9].filter(i => board._canMove({ type: Board.COLLAPSE, cells: i }))
    : [];
  
  const winHighlights = {};
  if (board.gameOver()) {
    board.tictactoes().forEach(t => {
      const pClass = t.player === Board.PLAYERX ? 'x' : 'o';
      t.cells.forEach(c => winHighlights[c] = pClass);
    });
  }

  return (
    <>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {screen === 'start' && (
        <div className="screen-container glass-panel">
          <h1 className="main-title">QUANTUM<br/><span>TIC-TAC-TOE</span></h1>
          <p className="subtitle">Superposition & Entanglement</p>
          <div className="button-group">
            <button className="btn primary" onClick={() => setScreen('game')}>Start Game</button>
            <button className="btn secondary" onClick={() => setShowRules(true)}>How to Play</button>
          </div>
        </div>
      )}

      {screen === 'game' && (
        <div className="screen-container">
          <div className="button-group">
            <button className="btn secondary" onClick={restartGame}>Restart Game</button>
            <button className="btn secondary" onClick={undoMove}>Undo Move</button>
          </div>
          
          <div className="quantumt3">
            {[0, 1, 2].map(row => (
              <div key={row} className="board-row">
                {[1, 2, 3].map(col => {
                  const index = row * 3 + col;
                  return (
                    <Cell 
                      key={index} 
                      index={index} 
                      pieceData={board.get(index)} 
                      onClick={handleCellClick}
                      halfMove={halfMove}
                      isCollapseHighlight={collapseHighlights.includes(index)}
                      winHighlight={winHighlights[index]}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {board.gameOver() && <p id="scores">{getScoresString()}</p>}
        </div>
      )}
    </>
  );
};

// Mount the App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);