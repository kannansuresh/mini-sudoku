export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | null;
export type Grid = CellValue[][];
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

// 6x6 Grid, 3x2 Regions (3 rows, 2 columns)
const ROWS = 6;
const COLS = 6;
// If I use 2 rows x 3 cols:
// Region 0: (0,0) to (1,2)
// Region 1: (0,3) to (1,5)
// ...
//
// "3 x 2" usually implies Width x Height or Rows x Cols.
// In Sudoku context, "3x2" often means 3 cells wide, 2 cells high.
// Let's stick to the standard "Mini Sudoku" which is often 2x3 (2 rows, 3 cols) or 3x2 (3 rows, 2 cols).
// I will implement 2 rows x 3 columns (Standard landscape rectangles) as it's more common for 6x6.
// BUT the user said "3 x2". I will assume 3 columns x 2 rows (Width x Height) which is 2 rows, 3 columns.
// Or did they mean 3 rows, 2 columns?
// Let's look at the prompt again: "6 regions (3 x2) grid".
const BOX_HEIGHT = 2;
const BOX_WIDTH = 3;

export const createEmptyGrid = (): Grid => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
};

export const isValid = (grid: Grid, row: number, col: number, num: CellValue): boolean => {
  if (num === null) return true;

  // Check Row
  for (let c = 0; c < COLS; c++) {
    if (grid[row][c] === num && c !== col) return false;
  }

  // Check Column
  for (let r = 0; r < ROWS; r++) {
    if (grid[r][col] === num && r !== row) return false;
  }

  // Check Region
  const startRow = Math.floor(row / BOX_HEIGHT) * BOX_HEIGHT;
  const startCol = Math.floor(col / BOX_WIDTH) * BOX_WIDTH;

  for (let r = 0; r < BOX_HEIGHT; r++) {
    for (let c = 0; c < BOX_WIDTH; c++) {
      if (grid[startRow + r][startCol + c] === num && (startRow + r !== row || startCol + c !== col)) {
        return false;
      }
    }
  }

  return true;
};

export const solveSudoku = (grid: Grid): boolean => {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col] === null) {
        for (let num = 1; num <= 6; num++) {
          if (isValid(grid, row, col, num as CellValue)) {
            grid[row][col] = num as CellValue;
            if (solveSudoku(grid)) return true;
            grid[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Seeded Random Number Generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Simple LCG
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

let rng = new SeededRandom(Date.now());

export const setSeed = (seed: number) => {
  rng = new SeededRandom(seed);
};

// Helper to get random number using our RNG
const getRandom = () => rng.next();

export const generateSudoku = (difficulty: Difficulty): Grid => {
  // 1. Create a full valid grid
  const grid = createEmptyGrid();

  // Randomize the first row to ensure randomness
  const firstRow = [1, 2, 3, 4, 5, 6].sort(() => getRandom() - 0.5);
  for(let c=0; c<6; c++) grid[0][c] = firstRow[c] as CellValue;

  solveSudoku(grid);

  // 2. Remove numbers based on difficulty
  let attempts = 0;
  let removeCount = 0;

  switch (difficulty) {
    case 'Easy': removeCount = 12; break;
    case 'Medium': removeCount = 18; break;
    case 'Hard': removeCount = 24; break;
  }

  const puzzle = grid.map(row => [...row]);

  while (attempts < removeCount) {
    const row = Math.floor(getRandom() * ROWS);
    const col = Math.floor(getRandom() * COLS);

    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      attempts++;
    }
  }

  return puzzle;
};

export const getDailyDifficulty = (): Difficulty => {
  // IST Time
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utc + istOffset);

  const day = istDate.getDay(); // 0 = Sunday, 1 = Monday, ...

  // Mon(1), Tue(2), Wed(3) -> Easy
  if (day >= 1 && day <= 3) return 'Easy';
  // Thu(4), Fri(5) -> Medium
  if (day === 4 || day === 5) return 'Medium';
  // Sat(6), Sun(0) -> Hard
  return 'Hard';
};

export const getDailySeed = (): number => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utc + istOffset);

  // Create a seed from YYYYMMDD
  const year = istDate.getFullYear();
  const month = istDate.getMonth() + 1;
  const date = istDate.getDate();

  return year * 10000 + month * 100 + date;
};


export const getHint = (grid: Grid, solution: Grid): { row: number, col: number, value: number, reason: string } | null => {
  // Helper to get candidates for a cell
  const getCandidates = (r: number, c: number): number[] => {
    const candidates: number[] = [];
    for (let num = 1; num <= 6; num++) {
      if (isValid(grid, r, c, num as CellValue)) {
        candidates.push(num);
      }
    }
    return candidates;
  };

  // Strategy A: Full House (Priority 1)
  // Check Rows
  for (let r = 0; r < ROWS; r++) {
    let emptyCount = 0;
    let emptyCol = -1;
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === null) {
        emptyCount++;
        emptyCol = c;
      }
    }
    if (emptyCount === 1) {
      const val = solution[r][emptyCol] as number; // We can trust solution or deduce it
      return { row: r, col: emptyCol, value: val, reason: `The only option left in this row is ${val}.` };
    }
  }

  // Check Cols
  for (let c = 0; c < COLS; c++) {
    let emptyCount = 0;
    let emptyRow = -1;
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][c] === null) {
        emptyCount++;
        emptyRow = r;
      }
    }
    if (emptyCount === 1) {
      const val = solution[emptyRow][c] as number;
      return { row: emptyRow, col: c, value: val, reason: `The only option left in this column is ${val}.` };
    }
  }

  // Check Regions
  for (let br = 0; br < ROWS; br += BOX_HEIGHT) {
    for (let bc = 0; bc < COLS; bc += BOX_WIDTH) {
      let emptyCount = 0;
      let lastEmpty = { r: -1, c: -1 };
      for (let r = 0; r < BOX_HEIGHT; r++) {
        for (let c = 0; c < BOX_WIDTH; c++) {
          if (grid[br + r][bc + c] === null) {
            emptyCount++;
            lastEmpty = { r: br + r, c: bc + c };
          }
        }
      }
      if (emptyCount === 1) {
        const val = solution[lastEmpty.r][lastEmpty.c] as number;
        return { row: lastEmpty.r, col: lastEmpty.c, value: val, reason: `The only option left in this region is ${val}.` };
      }
    }
  }

  // Strategy B: Hidden Single (Priority 2)
  // For each region, check if a number can only go in one spot
  for (let br = 0; br < ROWS; br += BOX_HEIGHT) {
    for (let bc = 0; bc < COLS; bc += BOX_WIDTH) {
      // For each number 1-6
      for (let num = 1; num <= 6; num++) {
        // Check if number is already in region
        let present = false;
        for (let r = 0; r < BOX_HEIGHT; r++) {
          for (let c = 0; c < BOX_WIDTH; c++) {
            if (grid[br + r][bc + c] === num) present = true;
          }
        }
        if (present) continue;

        // Find possible spots for 'num' in this region
        let possibleSpots: { r: number, c: number }[] = [];
        for (let r = 0; r < BOX_HEIGHT; r++) {
          for (let c = 0; c < BOX_WIDTH; c++) {
            if (grid[br + r][bc + c] === null) {
              // Check if valid placement for 'num' (ignoring that we are in the region loop, isValid checks row/col/region)
              // Actually isValid checks region too, but we know it's not in region yet.
              // So isValid is safe.
              if (isValid(grid, br + r, bc + c, num as CellValue)) {
                possibleSpots.push({ r: br + r, c: bc + c });
              }
            }
          }
        }

        if (possibleSpots.length === 1) {
          const spot = possibleSpots[0];
          return {
            row: spot.r,
            col: spot.c,
            value: num,
            reason: `This cell has to be ${num} due to all other cells in this region being blocked by other ${num}s.`
          };
        }
      }
    }
  }

  // Strategy C: Naked Single (Priority 3)
  // Find a cell that has only one candidate
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === null) {
        const candidates = getCandidates(r, c);
        if (candidates.length === 1) {
          const val = candidates[0];

          // Determine reason nuance
          // Check if eliminated by Row & Col only
          // We check if the other 5 numbers exist in Row U Col
          let rowColEliminatedAll = true;
          const otherNums = [1, 2, 3, 4, 5, 6].filter(n => n !== val);

          for (const other of otherNums) {
            let foundInRow = false;
            let foundInCol = false;
            // Check Row
            for(let cc=0; cc<COLS; cc++) if(grid[r][cc] === other) foundInRow = true;
            // Check Col
            for(let rr=0; rr<ROWS; rr++) if(grid[rr][c] === other) foundInCol = true;

            if (!foundInRow && !foundInCol) {
              rowColEliminatedAll = false;
              break;
            }
          }

          const reason = rowColEliminatedAll
            ? `The intersecting row and column leave ${val} as the only option left.`
            : `The intersecting row, column, and region leave ${val} as the only option left.`;

          return { row: r, col: c, value: val, reason };
        }
      }
    }
  }

  // Fallback: No logical move found
  // We can just pick the first empty cell and give the solution value, but warn user.
  // Or strictly follow instructions: "No logical move found..."
  // But the UI expects a hint to highlight a cell.
  // If we return null, nothing happens?
  // The interface expects { row, col, value, reason } or null.
  // If I return null, the "Hint" button does nothing?
  // The user said: "return message = ..."
  // But my return type is structured.
  // I will return a special hint that highlights a random empty cell (or first one) but gives the fallback message.

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === null) {
         return {
           row: r,
           col: c,
           value: solution[r][c] as number,
           reason: "No logical move found based on basic deduction. You may need to guess."
         };
      }
    }
  }

  return null;
};
export const getConflictingCells = (grid: Grid): Set<string> => {
  const conflicts = new Set<string>();

  // Check Rows
  for (let r = 0; r < ROWS; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < COLS; c++) {
      const val = grid[r][c];
      if (val !== null) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(c);
      }
    }
    seen.forEach((cols) => {
      if (cols.length > 1) {
        cols.forEach((c) => conflicts.add(`${r}-${c}`));
      }
    });
  }

  // Check Columns
  for (let c = 0; c < COLS; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < ROWS; r++) {
      const val = grid[r][c];
      if (val !== null) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(r);
      }
    }
    seen.forEach((rows) => {
      if (rows.length > 1) {
        rows.forEach((r) => conflicts.add(`${r}-${c}`));
      }
    });
  }

  // Check Regions
  for (let br = 0; br < ROWS; br += BOX_HEIGHT) {
    for (let bc = 0; bc < COLS; bc += BOX_WIDTH) {
      const seen = new Map<number, {r: number, c: number}[]>();
      for (let r = 0; r < BOX_HEIGHT; r++) {
        for (let c = 0; c < BOX_WIDTH; c++) {
          const row = br + r;
          const col = bc + c;
          const val = grid[row][col];
          if (val !== null) {
            if (!seen.has(val)) seen.set(val, []);
            seen.get(val)!.push({r: row, c: col});
          }
        }
      }
      seen.forEach((cells) => {
        if (cells.length > 1) {
          cells.forEach(({r, c}) => conflicts.add(`${r}-${c}`));
        }
      });
    }
  }

  return conflicts;
};
