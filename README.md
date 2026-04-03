# ⚛️ Quantum Tic-Tac-Toe

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![jQuery](https://img.shields.io/badge/jquery-%230769AD.svg?style=for-the-badge&logo=jquery&logoColor=white)

A browser-based simulation of **Quantum Tic-Tac-Toe**, demonstrating concepts of quantum superposition, entanglement, and wave-function collapse within a classic game theory framework. 

**[🔗 Play the Live Demo Here](https://sagnik-coder.github.io/Quantum-TicTacToe/)**

---

## 🧠 The Concept

Unlike classical Tic-Tac-Toe, this game introduces quantum mechanics to the board. Players don't place definitive pieces; they place "spooky" probabilities. 

### How the Quantum Engine Works:
1. **Superposition:** Each turn, a player places their mark in *two* different squares simultaneously. These marks exist in a state of superposition (they are both potentially real, but neither is definite yet).
2. **Entanglement:** As players share squares for their superposition moves, a network of entanglement is created across the board. The internal logic tracks this using a directed graph.
3. **The Collapse (Measurement):** When a sequence of entangled moves forms a closed loop (a cycle), a "measurement" is forced. The wave-function collapses. The player whose turn caused the cycle must choose one of the entangled cells to become a **Classical** (definite) state. This triggers a chain reaction, resolving the rest of the entangled loop.

---

## 🎮 How to Play

* **Player X (Blue) vs Player O (Red)**
* **Making a Move:** Click on two empty or quantum-filled squares to place your move in superposition. 
* **Resolving a Collapse:** If the board highlights purple, a cyclic entanglement has occurred. Click on the highlighted square to force the state to collapse into a classical piece.
* **Winning:** The game ends when a player achieves a classical Tic-Tac-Toe (three solid pieces in a row), or when the board is completely filled with classical pieces. The algorithm scores overlapping game states to declare the final winner.

---

## 🛠️ Technical Architecture

This application is built entirely with vanilla web technologies, utilizing an IIFE (Immediately Invoked Function Expression) architecture to encapsulate the game state and view logic.

* **State Management (`Board` Class):** Handles the mathematical representation of the 3x3 grid. It manages arrays of quantum moves, tracks the history stack for the Undo feature, and runs a cycle-detection algorithm (Depth-First Search) to identify when entanglement forces a collapse.
* **DOM Manipulation (`View` Class):** A jQuery-powered rendering engine that dynamically injects CSS-styled elements to represent probabilistic moves mathematically proportional to the board size.

---

## 🚀 Local Installation

Since this project has zero external dependencies other than a CDN link for jQuery, running it locally is instantaneous.

1. Clone the repository:
   ```bash
   git clone [https://github.com/Sagnik-Coder/Quantum-TicTacToe.git](https://github.com/Sagnik-Coder/Quantum-TicTacToe.git)
