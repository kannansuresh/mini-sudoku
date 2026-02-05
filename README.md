# Mini Sudoku

A clean, modern, and responsive implementation of the classic logic puzzle, built to test the limits of AI-assisted development. Inspired by the daily games on LinkedIn, this project focuses on minimalism and playability.

[**Play the game**](https://kannansuresh.github.io/mini-sudoku)

## About the Game

Mini Sudoku is a variation of the classic Sudoku puzzle, played on a **6x6 grid** divided into **six 3x2 regions**. The goal is simple but challenging:

**Fill the grid so that each row, column, and 3x2 shaded region contains the numbers 1 through 6 exactly once.**

### Key Features

* **Premium UI**: A clean, modern interface designed with aesthetic excellence.
* **Three Difficulty Levels**: Easy, Medium, and Hard.
* **Smart Features**: Hints, Notes, Undo/Redo, and dynamic highlighting.
* **Offline Support**: Play anywhere, anytime.

## Game Modes

### 1. Daily Challenge 📅

A unique puzzle every day, synchronized worldwide (based on Indian Standard Time).

* **Mon-Wed**: Easy
* **Thu-Fri**: Medium
* **Sat-Sun**: Hard
Compete with yourself to keep a streak!

### 2. Practice Mode 🎯

Generate unlimited random puzzles based on your preferred difficulty level. Perfect for sharpening your skills.

### 3. Custom Mode ✍️

Create your own puzzles or import them from external sources.

* **Manual Entry**: Input numbers to set up a specific puzzle. The system validates solvability.
* **Image Upload (OCR)**: Upload an image of a sudoku puzzle, and the game will scan and digitize it for you to play.

## How to Play

1. **Select a Cell**: Click or tap any empty cell in the grid.
2. **Enter a Number**: Use the on-screen keypad (1-6) or your physical keyboard.
3. **Notes**: Toggle "Notes" mode to pencil in possibilities. Smart notes automatically clear when a number is placed.
4. **Hints**: Stuck? Click "Hint" for a guided clue that explains *why* a number goes there, rather than just filling it in.
5. **Undo/Clear**: Made a mistake? Use Undo to step back or Clear to reset a cell.

## Settings

Customize your experience via the Settings menu:

* **Show Clock**: Track your solving time.
* **Autocheck**: Highlight incorrect numbers immediately (red).
* **Highlight Sections**: Visually emphasize the row, column, and region of the selected cell.
* **Count Remaining**: Display how many times each number (1-6) still needs to be placed.
* **Show Available Placements**: Dim numbers on the keypad that are already present in the current row/column/region.
* **Hide Finished Numbers**: Disable keypad buttons for numbers that are fully placed on the board.

## Tech Stack & Development

This project was built with a cutting-edge modern web stack:

* **Runtime**: [Bun](https://bun.sh)
* **Framework**: [React 19](https://react.dev)
* **Build Tool**: [Vite](https://vitejs.dev)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com) (using the new CSS-first configuration)
* **UI Components**: [Shadcn UI](https://ui.shadcn.com)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand)
* **Storage**: [Dexie.js](https://dexie.org) (IndexedDB wrapper)
* **OCR**: [Tesseract.js](https://github.com/naptha/tesseract.js)
* **Date Handling**: [date-fns](https://date-fns.org)

### Built with Antigravity

This application was developed using **Antigravity**, an advanced agentic AI coding assistant from the Google Deepmind team.

* **Agentic Workflow**: The development followed a structured "Plan -> Execute -> Verify" loop.
* **Context Awareness**: Antigravity managed the entire project structure, from setting up the `vite` + `bun` environment to implementing complex logic like the Sudoku generator and solver algorithms.
* **Design-First Approach**: The AI prioritized aesthetic guidelines to ensure a premium look and feel, strictly adhering to Tailwind CSS 4 best practices andshadcn/ui integration.

## Installation

To run this project locally:

1. **Clone the repository**
2. **Install dependencies**:

    ```bash
    bun install
    ```

3. **Start the dev server**:

    ```bash
    bun run dev
    ```

4. **Build for production**:

    ```bash
    bun run build
    ```

## Contributing 🤝🏼

Contributions are welcome! Whether it's adding new difficulty levels, improving the scoring algorithm, or refining the UI.

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request
