🧠 **MATH CHAIN**

Math Chain is a browser-based arithmetic puzzle game where the player are challenged to combine a set of random numbers using basic arithmetic operations to reach a specific target number. 

🚀 **Play it Here**  
You can play MATH CHAIN directly in your browser here: https://meileng-tan.github.io/browser-game-project-math-chain/ 

🎮 **How to Play**  
The objective is to reach the Target Number by performing arithmetic operations witht he available numbers on the board. 
1. **Select a Difficulty**: From the Main Menu, choose your challenge level.  
     Note:  
       Easy Mode: Only Addition (+) and Subtraction (-).  
       Medium/ Hard Mode: Addition (+), Subtraction (-), Multiplication (x), and Division (÷).  
3. **Choose a number** : Click any number on the board to start the equation. Click on the same number again to deselect. 
4. **Choose an Operator** Select an arithmetic operator (+, -, *, /). Click it again to deselect. 
5. **Choose a second number** : Choose the second number to complete the operation. Click on the same number again to deselect.  
    Note:  
       For subtraction, only numbers that result in a positive value can be selected.  
       For division, numbers that would result in a remainder cannot be selected.  
6. **Solve**: CLick the = button to solve the equation. The first selected number button on the board will be updated with the result, and the second button will disappear. 
7. **Chain Together**: Repeat steps 1-5 until you reach the target number.
  
**TIPS!** Made a mistake? Use the Undo button to revert your last move and try a different strategy.
  
**🖼️ Screenshots**  
<img width="534" height="434" alt="image" src="https://github.com/user-attachments/assets/faab5889-3130-44bd-841d-296327b49b4c" />
<img width="589" height="601" alt="image" src="https://github.com/user-attachments/assets/3db53b98-4e96-4ebb-90e6-871ec0693e74" />
<img width="586" height="695" alt="image" src="https://github.com/user-attachments/assets/b4f1537d-4cc9-4ae4-8914-0475e3b9e1c9" />


  
**✨ Game Features**  
- Tiered difficulty: Easy mode only use addition and subtraction, medium and hard mode involves full complexity of all four addition, subtraction, multiplication and division operators.
- Player can return to the level selection screen at any time to switch challenge levels.
- Randomly generates numbers and a target number for each game.
- Player can toggle their selections.
- Tracks player moves and time. 
- Undo features for moves
- Dynamic history board showing moves and operations.
- Win message with a summary of total time and moves taken.

**⚙️ Game Logics**  
MATH CHAIN is a browser-based game built with HTML, CSS and Javascript.    
* Difficulty and Operator Filtering
  - Game level state: A global game difficulty level state is set upon selection from the Main Menu.
  - Operator configuration: The UI dynamically updates to filter the available operations. For Easy mode, only addition and subtraction are enabled, while the full set of arithmetic operators, addition, subtraction, multiplication and division are enabled for Medium and Hard mode. 

* Random Number Generation Logic  
  - Random numbers: Six random integers are generated based on a range specific to the chosen difficulty level.
  - Target calculation: To guarantee that every game is solvable, the game engine randomly selects five of the six numbers and performs a sequence of calculations to derive the Target Number.
  
* State Management
  - The number board is managed as an array of objects, which tracks the numerical values and button visibility state.
  - When an equation is solved, the game engine updates the value of the first selected number with the result and sets the visibility of the second button to false, effectively removing it from the game board while maintaining it in data structure for potential undoing.
  
* Save and Restore
  - Save: Every move is pushed into the history stack.
  - Restore: The Undo button pops the most recent move from the history. The engine then re-renders the board, restoring the hidden button and reverting the first number to its previous value.
  
* Calculation Validation Logic
  - Non-Negative Constraint: For subtraction, the logic blocks moves that would result in a negative number.
  - Integer Constraint: For division, the logic uses modulo operator to check and block moves that would produce remainders.

**⚡️ Future improvements**  
- Responsive design: Optimization for mobile and tablet screens.
- Leaderboard: Local storage to track high score by difficulty.
- Hint system: 'Next Move' suggestiong for stuck players.
