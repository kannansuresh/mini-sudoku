---
trigger: always_on
---



**You are an expert software engineer with expertise in building mini web games using React framework. You are an expert in Shadcn UI and tailwind css 4.**

**Use bun instead of npm**

Follow the rules

- shadcnui.md
- tailwindcss4.md
- instructions.md

I want you to build a mini sudoku game (6 x 6) grid with 6 regions (3 x2) grid

Each row, column, and region must contain the numbers 1–6, with no repeats.

- There should be three levels of difficulty 

  - Hard
  - Medium
  - Easy

- There should be 3 modes for the puzzle

  - A unique puzzle every day (this should be same for all users accessing the puzzle world wide on a day. This should follow Indian standard time to calcuate the day)

    - Puzzles should be easy on Monday, Tuesday and Wednesday
    - Puzzles should be medium on Thursday and Friday
    - Puzzles should be hard on Saturday and Sunday

  - Random puzzles users can play for practice

    - they can select diffculty level
    - the solution should generate a puzzle for them based on the difficulty choosen

  - User should be able to generate a puzzle on their own

    - User can put numbers in random places and start solving the puzzle

      - System should validate their puzzle creation and show them errors if they have made an unsolvable puzzle or which breaks the rules of mini sudoku.

    - User can upload an image from some other site (*t**o implement this, use some feature which does not require any kind of license or payment, if you don't have that option skip this part***)

      - Solution should read the image and create the puzzle after validation
      - Any errors should be displayed
      - Allow the puzzle if it follows all rules

      

  ## Game play

  - User shoudl be presented with the puzzle on top
  - A keyboard below the puzzle
    - Numbers 1 to 6
    - button to clear value written in a cell
    - button to undo the actions they have performed in the cells. (undo option should be able to take the user back till the start of the puzzle on repeated clicking)
    - If they click on their hardware keyboard numbers after selecting a cell, that too should get reflected in the cell
  - A hint button, which shows a hint if the user is stuck
    - Hint should not simply fill the value for them
    - It should higlight the cell based on the condition and explain why a specific number is the only possibility there.
  - A notes button, when enabled should allow users to specify possible value in a cell. This should be represented in an appropriate font, different from the other.
  - Show a subtle confetti animation when a region, row or column is solved. Animation should be restricted within the solved region, column or row

  

  ### Settings

  User should have the following settings

  - Show clock - toggle
    - Should show the amount of time they have tried to solve the puzzle (if turned on it should show in the interface)
  - Autocheck - toggle
    - Show errors on the grid if the enter any incorrect number
  - Highlight sections - toggle
    - Highlight sections affected by a cell when user clicks on a cell
  - Count remaining numbers - toggle
    - Show the count of remaining numbers on top of each number. For example if 4 has to be placed 5 more times in the grid, it should show it in the keyboard respective to 4
  - Show avaialble placements - toggle
    - If enabled, this should show the possible options user can enter if they select a cell. Values already entered in the region, row or column should be disabled in the keyboard
  - Hide finished number - toggle
    - If enabled it should disable the button corresponding to the number

  

  ## Below are the instructions I am planning to give the user for game play

  Mini Sudoku is a bite-sized number puzzle handcrafted by the originators of “Sudoku” and the 3x World Sudoku Champion. Fill the grid so each row, column, and shaded region contains every number exactly once.

  **Rules**

  Each number must appear exactly once in every row, column, and region.

  **Playing Mini Sudoku**

  1. Go to the game page.
  2. Click or tap **Solve puzzle**.
  3. You’ll see a grid with some numbers already filled in.
  4. Click or tap a cell and then select a number from the keypad below the grid to place it in the cell.
  5. Fill the entire grid to complete the puzzle.

​	**Game assistance**

- If you’re stuck, click or tap **Hint**. It highlights a cell and offers a suggestion, or lets you know if a number is incorrect.
- If you make a mistake, click or tap **Undo** to revert your last move.
- To start fresh, click or tap **Clear** to clear the grid.
- Turn on **Count remaining numbers** in the **Settings** to keep track of how many placements remain for each number in the keypad.
- Turn on **Highlight sections** in the **Settings** to show all related cells for the selected cell, which can help you make deductions.
- **Use notes to try out possible numbers:**
  - Turn on **Notes** to enter note-taking mode.
  - You can enter multiple possible numbers in a single cell.
  - If you add a number in a cell with notes, the notes will disappear. Remove the number to see the notes again.
  - Click or Tap **Erase** to remove the notes.
  - Turn off **Notes** to return to regular mode.