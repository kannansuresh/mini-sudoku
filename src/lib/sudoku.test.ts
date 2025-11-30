import { describe, it, expect } from 'bun:test';
import { createEmptyGrid, isValid, solveSudoku, generateSudoku } from './sudoku';

describe('Sudoku Logic', () => {
  it('should create an empty grid', () => {
    const grid = createEmptyGrid();
    expect(grid.length).toBe(6);
    expect(grid[0].length).toBe(6);
    expect(grid[0][0]).toBe(null);
  });

  it('should validate a move correctly', () => {
    const grid = createEmptyGrid();
    grid[0][0] = 1;

    // Same row
    expect(isValid(grid, 0, 1, 1)).toBe(false);
    // Same col
    expect(isValid(grid, 1, 0, 1)).toBe(false);
    // Same region (0,0 is in region 0 which covers 0,0 to 1,2)
    expect(isValid(grid, 1, 1, 1)).toBe(false);

    // Valid move
    expect(isValid(grid, 0, 1, 2)).toBe(true);
  });

  it('should solve a grid', () => {
    const grid = createEmptyGrid();
    // Seed it a bit to make it faster/deterministic?
    // solveSudoku handles empty grid fine for 6x6
    const solved = solveSudoku(grid);
    expect(solved).toBe(true);

    // Check if full
    let isFull = true;
    for(let r=0; r<6; r++) {
      for(let c=0; c<6; c++) {
        if(grid[r][c] === null) isFull = false;
      }
    }
    expect(isFull).toBe(true);
  });

  it('should generate an Easy puzzle within clue range', () => {
    const puzzle = generateSudoku('Easy');
    let clueCount = 0;
    for(let r=0; r<6; r++) for(let c=0; c<6; c++) if(puzzle[r][c] !== null) clueCount++;

    // Easy: 17-20 clues
    expect(clueCount).toBeGreaterThanOrEqual(17);
    expect(clueCount).toBeLessThanOrEqual(20);
  });

  it('should generate a Medium puzzle within clue range', () => {
    const puzzle = generateSudoku('Medium');
    let clueCount = 0;
    for(let r=0; r<6; r++) for(let c=0; c<6; c++) if(puzzle[r][c] !== null) clueCount++;

    // Medium: 12-16 clues
    expect(clueCount).toBeGreaterThanOrEqual(12);
    expect(clueCount).toBeLessThanOrEqual(16);
  });

  it('should generate a Hard puzzle within clue range', () => {
    const puzzle = generateSudoku('Hard');
    let clueCount = 0;
    for(let r=0; r<6; r++) for(let c=0; c<6; c++) if(puzzle[r][c] !== null) clueCount++;

    // Hard: 8-11 clues
    expect(clueCount).toBeGreaterThanOrEqual(8);
    expect(clueCount).toBeLessThanOrEqual(11);
  });
});
