// ============================================================================
// CODEQUEST FIRESTORE SEEDING SERVICE - DISTINCT MULTI-MODE QUESTION POOL
// Populates 5 non-repeating questions per mode (Quiz, Output Prediction, Bug-Fix) 
// across all 5 curriculum levels, aligned with Figma UI specifications.
// ============================================================================

import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Seeds Firestore with metadata topics and unique questions separated strictly 
 * by challengeMode ('Quiz', 'Output Prediction', 'Bug-Fix').
 */
export async function seedExpandedCodeQuestDatabase() {
  try {
    console.log("Starting distinct mode question seeding into Firestore...");

    // ==========================================================================
    // 1. TOPICS METADATA DEFINITION (5 Levels)
    // ==========================================================================
    const topics = [
      { id: 'topic_1', title: 'Hello Python', description: 'print() & strings', order: 1 },
      { id: 'topic_2', title: 'Variables', description: 'names & values', order: 2 },
      { id: 'topic_3', title: 'Conditionals', description: 'if, elif, else', order: 3 },
      { id: 'topic_4', title: 'Loops', description: 'for & while loops', order: 4 },
      { id: 'topic_5', title: 'Functions', description: 'def & return', order: 5 },
    ];

    // Save each topic document into Firestore
    for (const topic of topics) {
      await setDoc(doc(db, 'topics', topic.id), topic);
    }

    // ==========================================================================
    // 2. DISTINCT QUESTION POOL (5 Quiz, 5 Output Predictions, 5 Bug-Fixes per Topic)
    // ==========================================================================
    const questionPool = {
      
      // ----------------------------------------------------------------------
      // TOPIC 1: HELLO PYTHON
      // ----------------------------------------------------------------------
      topic_1: [
        // --- QUIZ MODE (Theory & Concepts) ---
        { id: 't1_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Basic Output Function', questionText: 'Which built-in function outputs text to the console in Python?', options: ['print()', 'echo()', 'write()', 'display()'], correctAnswer: 'print()', explanation: 'print() is the standard Python function used to display output.' },
        { id: 't1_q2', challengeType: 'Quiz', difficulty: 'easy', title: 'String Delimiters', questionText: 'How must text strings be enclosed in Python code?', options: ['Single or double quotes', 'Curly braces', 'Angle brackets', 'Parentheses only'], correctAnswer: 'Single or double quotes', explanation: 'Python accepts single (\'\') or double ("") quotes for string literals.' },
        { id: 't1_q3', challengeType: 'Quiz', difficulty: 'medium', title: 'Case Sensitivity', questionText: 'Is Python case-sensitive when evaluating built-in functions?', options: ['Yes', 'No', 'Only for variables', 'Only on Linux'], correctAnswer: 'Yes', explanation: 'Python is strictly case-sensitive (e.g., Print() will raise an error).' },
        { id: 't1_q4', challengeType: 'Quiz', difficulty: 'medium', title: 'Comment Symbol', questionText: 'Which symbol denotes a single-line comment in Python?', options: ['#', '//', '/*', '<!--'], correctAnswer: '#', explanation: 'The hash symbol (#) tells the interpreter to ignore the rest of the line.' },
        { id: 't1_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Script Extension', questionText: 'What is the standard file extension for Python source code files?', options: ['.py', '.pt', '.python', '.pyt'], correctAnswer: '.py', explanation: 'Python source files use the .py file extension.' },

        // --- OUTPUT PREDICTION MODE (Code Execution Tracking) ---
        { id: 't1_op1', challengeType: 'Output Prediction', difficulty: 'easy', title: 'String Concatenation', codeSnippet: 'print("Code" + "Quest")', questionText: 'What does this code print?', options: ['CodeQuest', 'Code Quest', 'Error', 'Code+Quest'], correctAnswer: 'CodeQuest', explanation: 'The + operator concatenates text strings directly without adding spaces.' },
        { id: 't1_op2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'String Multiplication', codeSnippet: 'print("Py" * 3)', questionText: 'What does this code print?', options: ['PyPyPy', 'Py3', 'Error', 'Py Py Py'], correctAnswer: 'PyPyPy', explanation: 'Multiplying a string by an integer repeats the string that many times.' },
        { id: 't1_op3', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Escape Newline', codeSnippet: 'print("Hello\\nWorld")', questionText: 'What does this code print?', options: ['New line', 'Tab space', 'Backslash', 'Nothing'], correctAnswer: 'New line', explanation: '\\n inserts a vertical line break in the string output.' },
        { id: 't1_op4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Nested Quote Handling', codeSnippet: 'print("It\'s Python")', questionText: 'What does this code print?', options: ["It's Python", "It\\'s Python", 'Error', 'Python'], correctAnswer: "It's Python", explanation: 'The backslash escapes the single quote so it prints correctly inside double quotes.' },
        { id: 't1_op5', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Comma Separators', codeSnippet: 'print("Python", "is", "fun")', questionText: 'What does this code print?', options: ['Python is fun', 'Python,is,fun', 'Pythonisdun', 'Error'], correctAnswer: 'Python is fun', explanation: 'Passing multiple comma-separated arguments to print() inserts a space between them.' },

        // --- BUG-FIX MODE (Terminal Error Resolution) ---
        { id: 't1_bf1', challengeType: 'Bug-Fix', difficulty: 'easy', title: 'Squash that bug', questionText: 'This code raises a NameError. Which line 1 replacement fixes it?', codeSnippet: '1  prnt("Hello World")', errorText: 'NameError: name \'prnt\' is not defined', options: ['print("Hello World")', 'echo("Hello World")', 'console.log("Hello World")', 'display("Hello World")'], correctAnswer: 'print("Hello World")', explanation: 'Fix the typo from "prnt" to the valid function name "print".' },
        { id: 't1_bf2', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Squash that bug', questionText: 'This code raises a SyntaxError. Which replacement fixes line 1?', codeSnippet: '1  print("Hello Python)', errorText: 'SyntaxError: unterminated string literal', options: ['print("Hello Python")', 'print(\'Hello Python")', 'print(Hello Python)', 'print("Hello Python"'], correctAnswer: 'print("Hello Python")', explanation: 'Strings must have matching opening and closing double quotes.' },
        { id: 't1_bf3', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Squash that bug', questionText: 'Python 3 requires parentheses. Which replacement fixes line 1?', codeSnippet: '1  print "Hello World"', errorText: 'SyntaxError: Missing parentheses in call to \'print\'', options: ['print("Hello World")', 'print("Hello World");', 'print{Hello World}', 'echo("Hello World")'], correctAnswer: 'print("Hello World")', explanation: 'Python 3 requires function arguments to be wrapped in parentheses.' },
        { id: 't1_bf4', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This code has mismatched parentheses. How do you fix line 1?', codeSnippet: '1  print("Hello" ))', errorText: 'SyntaxError: unmatched \')\'', options: ['print("Hello")', 'print(("Hello")', 'print "Hello"', 'print("Hello))'], correctAnswer: 'print("Hello")', explanation: 'Remove the extra closing parenthesis to match syntax rules.' },
        { id: 't1_bf5', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This code references an undefined variable. How do you fix line 1?', codeSnippet: '1  print(greeting)', errorText: 'NameError: name \'greeting\' is not defined', options: ['greeting = "Hi"\nprint(greeting)', 'print("greeting")', 'print(str(greeting))', 'def greeting():'], correctAnswer: 'greeting = "Hi"\nprint(greeting)', explanation: 'Variables must be assigned a value before they can be printed.' },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 2: VARIABLES
      // ----------------------------------------------------------------------
      topic_2: [
        // --- QUIZ ---
        { id: 't2_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Variable Naming Rules', questionText: 'Which of the following is an INVALID variable name in Python?', options: ['1st_player', 'player_1', '_score', 'playerOne'], correctAnswer: '1st_player', explanation: 'Variable names cannot start with a numeric digit.' },
        { id: 't2_q2', challengeType: 'Quiz', difficulty: 'medium', title: 'Division Data Type', questionText: 'What data type is returned by standard division (/) in Python 3?', options: ['float', 'int', 'str', 'bool'], correctAnswer: 'float', explanation: 'Standard division (/) always returns a floating-point number.' },
        { id: 't2_q3', challengeType: 'Quiz', difficulty: 'medium', title: 'Dynamic Typing', questionText: 'Can a Python variable change its assigned data type during execution?', options: ['Yes', 'No', 'Only numbers', 'Only strings'], correctAnswer: 'Yes', explanation: 'Python is dynamically typed, so variables can reference different data types over time.' },
        { id: 't2_q4', challengeType: 'Quiz', difficulty: 'hard', title: 'Assignment Operator', questionText: 'Which symbol is used to bind values to variable names?', options: ['=', '==', '->', ':='], correctAnswer: '=', explanation: 'The single equals sign (=) assigns values to variables.' },
        { id: 't2_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Keyword Restriction', questionText: 'Which of the following cannot be used as a variable name?', options: ['class', 'my_class', 'class_name', 'klass'], correctAnswer: 'class', explanation: 'Reserved keywords like class, def, and for are part of Python syntax and cannot be variable names.' },

        // --- OUTPUT PREDICTION ---
        { id: 't2_op1', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Variable Reassignment', codeSnippet: 'coins = 3\ncoins = coins + 2\nprint(coins)', questionText: 'What does this code print?', options: ['5', '3', '32', 'coins'], correctAnswer: '5', explanation: 'coins starts at 3, then 2 is added, resulting in 5[cite: 10].' },
        { id: 't2_op2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Multiple Variables', codeSnippet: 'a = 2\nb = 3\nprint(a * b + a)', questionText: 'What does this code print?', options: ['8', '6', '10', 'Error'], correctAnswer: '8', explanation: 'Multiplication evaluates first: (2 * 3) + 2 = 8.' },
        { id: 't2_op3', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Type Reassignment', codeSnippet: 'x = "Hello"\nx = 5\nprint(x)', questionText: 'What does this code print?', options: ['5', 'Hello', 'Error', 'Hello5'], correctAnswer: '5', explanation: 'Variable x is reassigned from string "Hello" to integer 5.' },
        { id: 't2_op4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Tuple Assignment', codeSnippet: 'x, y = 5, 10\nprint(x + y)', questionText: 'What does this code print?', options: ['15', '510', 'Error', '5'], correctAnswer: '15', explanation: 'x becomes 5 and y becomes 10, adding up to 15.' },
        { id: 't2_op5', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Float Inspection', codeSnippet: 'pi = 3.14\nprint(type(pi))', questionText: 'What does this code print?', options: ["<class 'float'>", "<class 'int'>", "<class 'str'>", "<class 'double'>"], correctAnswer: "<class 'float'>", explanation: 'Numbers containing decimals are classified as float type.' },

        // --- BUG-FIX ---
        { id: 't2_bf1', challengeType: 'Bug-Fix', difficulty: 'easy', title: 'Squash that bug', questionText: 'This code raises a NameError. Which line 2 replacement fixes it?', codeSnippet: '1  name = "Maya"\n2  print(Name)', errorText: 'NameError: name \'Name\' is not defined', options: ['print(name)', 'print("Name")', 'print(NAME)', 'print(\'Maya\')'], correctAnswer: 'print(name)', explanation: 'Python is case-sensitive. name and Name are distinct variables[cite: 9].' },
        { id: 't2_bf2', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Squash that bug', questionText: 'This code references score before assignment. How do you fix line 1?', codeSnippet: '1  print(score)\n2  score = 50', errorText: 'NameError: name \'score\' is not defined', options: ['score = 50\nprint(score)', 'print(score = 50)', 'score == 50', 'global score'], correctAnswer: 'score = 50\nprint(score)', explanation: 'Variables must be assigned values before they are referenced.' },
        { id: 't2_bf3', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Squash that bug', questionText: 'This code uses a reserved keyword as a variable name. How do you fix line 1?', codeSnippet: '1  for = 10\n2  print(for)', errorText: 'SyntaxError: invalid syntax', options: ['num_for = 10', 'print(for)', 'for_loop = 10', 'define for = 10'], correctAnswer: 'num_for = 10', explanation: 'Reserved keywords cannot be used as variable names.' },
        { id: 't2_bf4', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This assignment is incomplete. How do you fix line 1?', codeSnippet: '1  total_score = ', errorText: 'SyntaxError: unexpected EOF while parsing', options: ['total_score = 100', 'total_score == 100', 'print(total_score)', 'total_score ='], correctAnswer: 'total_score = 100', explanation: 'The assignment operator requires a value on the right-hand side.' },
        { id: 't2_bf5', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This code raises a TypeError. Which replacement fixes line 1?', codeSnippet: '1  print("Age: " + 25)', errorText: 'TypeError: can only concatenate str (not "int") to str', options: ['print("Age: " + str(25))', 'print("Age: ", 25)', 'Both A and B', 'print(str("Age: ") + 25)'], correctAnswer: 'Both A and B', explanation: 'Strings and integers cannot be concatenated with +, use str() conversion or commas.' },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 3: CONDITIONALS
      // ----------------------------------------------------------------------
      topic_3: [
        // --- QUIZ ---
        { id: 't3_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Elif Keyword', questionText: 'Which keyword handles secondary conditional branches in Python?', options: ['elif', 'else if', 'elseif', 'then'], correctAnswer: 'elif', explanation: 'Python uses the keyword elif for multiple conditional branches.' },
        { id: 't3_q2', challengeType: 'Quiz', difficulty: 'easy', title: 'Equality Comparison', questionText: 'Which operator checks if two values are equal?', options: ['==', '=', '===', 'equals'], correctAnswer: '==', explanation: '== is the comparison operator for equality.' },
        { id: 't3_q3', challengeType: 'Quiz', difficulty: 'medium', title: 'Logical Conjunction', questionText: 'Which keyword requires both conditions to be true?', options: ['and', 'or', 'not', '&'], correctAnswer: 'and', explanation: 'The and keyword evaluates to true only if both expressions are true.' },
        { id: 't3_q4', challengeType: 'Quiz', difficulty: 'medium', title: 'Indentation Rules', questionText: 'How does Python structure blocks inside conditional statements?', options: ['Indentation (Whitespace)', 'Curly braces {}', 'Parentheses ()', 'Semicolons'], correctAnswer: 'Indentation (Whitespace)', explanation: 'Python uses indentation to define code block scopes.' },
        { id: 't3_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Boolean Values', questionText: 'What are the two valid boolean literal values in Python?', options: ['True and False', 'yes and no', '1 and 0', 'ON and OFF'], correctAnswer: 'True and False', explanation: 'Booleans in Python must be capitalized as True and False.' },

        // --- OUTPUT PREDICTION ---
        { id: 't3_op1', challengeType: 'Output Prediction', difficulty: 'medium', title: 'If-Else Execution', codeSnippet: 'score = 75\nif score >= 50:\n    print("Pass")\nelse:\n    print("Fail")', questionText: 'What does this code print?', options: ['Pass', 'Fail', '75', 'Error'], correctAnswer: 'Pass', explanation: '75 >= 50 evaluates to True, executing the if block.' },
        { id: 't3_op2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Ternary Evaluation', codeSnippet: 'x = 10\nprint("Yes" if x > 5 else "No")', questionText: 'What does this code print?', options: ['Yes', 'No', '10', 'Error'], correctAnswer: 'Yes', explanation: '10 > 5 is True, returning "Yes".' },
        { id: 't3_op3', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Elif Branching', codeSnippet: 'x = 20\nif x > 30:\n    print("A")\nelif x > 15:\n    print("B")\nelse:\n    print("C")', questionText: 'What does this code print?', options: ['B', 'A', 'C', 'Error'], correctAnswer: 'B', explanation: 'The first condition is false, but x > 15 is true, executing the elif block.' },
        { id: 't3_op4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Logical And', codeSnippet: 'x = 10\nprint(x > 5 and x < 15)', questionText: 'What does this code print?', options: ['True', 'False', '10', 'Error'], correctAnswer: 'True', explanation: 'Both 10 > 5 and 10 < 15 are true.' },
        { id: 't3_op5', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Simple If', codeSnippet: 'if True:\n    print("A")', questionText: 'What does this code print?', options: ['A', 'True', 'False', 'Error'], correctAnswer: 'A', explanation: 'The condition is explicitly True.' },

        // --- BUG-FIX ---
        { id: 't3_bf1', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This code raises a SyntaxError. Which replacement fixes line 1?', codeSnippet: '1  if age >= 18\n2      print("Adult")', errorText: 'SyntaxError: expected \':\'', options: ['if age >= 18:', 'if (age >= 18)', 'if age >= 18 then:', 'if: age >= 18'], correctAnswer: 'if age >= 18:', explanation: 'Conditional headers require a colon (:) at the end.' },
        { id: 't3_bf2', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Squash that bug', questionText: 'This condition uses an assignment operator instead of comparison. How do you fix line 1?', codeSnippet: '1  if x = 5:\n2      print("Equal")', errorText: 'SyntaxError: invalid syntax', options: ['if x == 5:', 'if x equals 5:', 'if(x := 5):', 'if x: 5'], correctAnswer: 'if x == 5:', explanation: 'Use the comparison operator == inside conditional statements.' },
        { id: 't3_bf3', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Squash that bug', questionText: 'This code raises an IndentationError. How do you fix line 2?', codeSnippet: '1  if True:\n2  print("Hello")', errorText: 'IndentationError: expected an indented block', options: ['    print("Hello")', 'print("Hello")', 'print(True)', 'tab print("Hello")'], correctAnswer: '    print("Hello")', explanation: 'Code blocks following a colon must be indented.' },
        { id: 't3_bf4', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This code uses an invalid logical operator. How do you fix line 1?', codeSnippet: '1  if x > 5 & x < 10:', errorText: 'TypeError: unsupported operand type(s)', options: ['if x > 5 and x < 10:', 'if x > 5 && x < 10:', 'if x > 5 || x < 10:', 'if (x > 5) (x < 10):'], correctAnswer: 'if x > 5 and x < 10:', explanation: 'Use the `and` keyword instead of `&` for boolean logic.' },
        { id: 't3_bf5', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This conditional has unmatched parentheses. How do you fix line 1?', codeSnippet: '1  if (score >= 50:', errorText: 'SyntaxError: unmatched \')\' or missing \')\'', options: ['if score >= 50:', 'if score >= 50)', 'if (score >= 50):', 'if score == 50:'], correctAnswer: 'if (score >= 50):', explanation: 'Parentheses must be correctly balanced and closed before the colon.' },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 4: LOOPS
      // ----------------------------------------------------------------------
      topic_4: [
        // --- QUIZ ---
        { id: 't4_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Loop Exit', questionText: 'Which statement immediately terminates a running loop?', options: ['break', 'stop', 'exit', 'continue'], correctAnswer: 'break', explanation: 'break exits the current loop body immediately.' },
        { id: 't4_q2', challengeType: 'Quiz', difficulty: 'easy', title: 'Loop Skip', questionText: 'Which keyword skips the current iteration and jumps to the next cycle?', options: ['continue', 'skip', 'next', 'pass'], correctAnswer: 'continue', explanation: 'continue skips remaining statements in the current iteration.' },
        { id: 't4_q3', challengeType: 'Quiz', difficulty: 'medium', title: 'Range Function', questionText: 'What sequence does range(5) generate?', options: ['Numbers from 0 to 4', 'Numbers from 1 to 5', 'Numbers from 0 to 5', 'Random numbers'], correctAnswer: 'Numbers from 0 to 4', explanation: 'range(n) starts at 0 and counts up to n-1.' },
        { id: 't4_q4', challengeType: 'Quiz', difficulty: 'medium', title: 'While Loops', questionText: 'When should you use a while loop instead of a for loop?', options: ['When looping based on an indefinite condition', 'When iterating over lists', 'When running a fixed count', 'For speed'], correctAnswer: 'When looping based on an indefinite condition', explanation: 'While loops run continuously as long as their boolean condition is true.' },
        { id: 't4_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Loop Else', questionText: 'When does an optional loop else clause execute?', options: ['When the loop finishes normally without a break', 'Whenever a break occurs', 'Before loop start', 'On error'], correctAnswer: 'When the loop finishes normally without a break', explanation: 'A loop else block runs only if the loop completes without hitting a break statement.' },

        // --- OUTPUT PREDICTION ---
        { id: 't4_op1', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Range Output', codeSnippet: 'for i in range(3):\n    print(i, end=" ")', questionText: 'What does this code print?', options: ['0 1 2', '1 2 3', '0 1 2 3', '3'], correctAnswer: '0 1 2', explanation: 'range(3) yields 0, 1, and 2.' },
        { id: 't4_op2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'While Counter', codeSnippet: 'x = 0\nwhile x < 2:\n    print(x, end="")\n    x += 1', questionText: 'What does this code print?', options: ['01', '012', '12', '02'], correctAnswer: '01', explanation: 'x prints 0, increments to 1, prints 1, then terminates.' },
        { id: 't4_op3', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Step Range', codeSnippet: 'for i in range(1, 6, 2):\n    print(i, end=" ")', questionText: 'What does this code print?', options: ['1 3 5', '1 2 3 4 5', '2 4 6', '1 4'], correctAnswer: '1 3 5', explanation: 'Starts at 1, ends before 6, incrementing by 2.' },
        { id: 't4_op4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'String Iteration', codeSnippet: 'for c in "Py":\n    print(c, end="-")', questionText: 'What does this code print?', options: ['P-y-', 'Py-', 'P-y', '-P-y'], correctAnswer: 'P-y-', explanation: 'Loops through characters P and y with separator dashes.' },
        { id: 't4_op5', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Simple For', codeSnippet: 'for i in range(2):\n    print("Hi")', questionText: 'How many times does this loop print?', options: ['2', '1', '3', '0'], correctAnswer: '2', explanation: 'range(2) iterates twice (indices 0 and 1).' },

        // --- BUG-FIX ---
        { id: 't4_bf1', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Squash that bug', questionText: 'This while loop creates an infinite loop. Which replacement fixes line 3?', codeSnippet: '1  count = 0\n2  while count < 3:\n3      print(count)', errorText: 'RuntimeError: Infinite Loop Detected', options: ['count += 1', 'count = 3', 'break', 'continue'], correctAnswer: 'count += 1', explanation: 'Incrementing the counter ensures the loop condition eventually becomes false.' },
        { id: 't4_bf2', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Squash that bug', questionText: 'This for loop is missing its colon. How do you fix line 1?', codeSnippet: '1  for i in range(5)\n2      print(i)', errorText: 'SyntaxError: expected \':\'', options: ['for i in range(5):', 'for (i in range(5)):', 'for i = 0 to 5:', 'for i in range(5) then:'], correctAnswer: 'for i in range(5):', explanation: 'For loop headers require a closing colon (:).' },
        { id: 't4_bf3', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This code raises a SyntaxError. How do you fix line 2?', codeSnippet: '1  print("Hello")\n2  break', errorText: 'SyntaxError: \'break\' outside loop', options: ['Remove break or wrap in a loop', 'Change break to continue', 'Add a colon', 'Indent line 2'], correctAnswer: 'Remove break or wrap in a loop', explanation: 'The break statement can only be used inside a for or while loop body.' },
        { id: 't4_bf4', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This loop body has an IndentationError. How do you fix line 2?', codeSnippet: '1  for i in range(3):\n2  print(i)', errorText: 'IndentationError: expected an indented block', options: ['    print(i)', 'print(i)', 'tab print(i)', 'i = print(i)'], correctAnswer: '    print(i)', explanation: 'Loop statements must be properly indented.' },
        { id: 't4_bf5', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This range function receives a string instead of an int. How do you fix line 1?', codeSnippet: '1  for i in range("5"):', errorText: 'TypeError: \'str\' object cannot be interpreted as an integer', options: ['for i in range(int("5")):', 'for i in range(5):', 'Both A and B', 'for i in range(range(5)):'], correctAnswer: 'Both A and B', explanation: 'range() accepts integer arguments only.' },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 5: FUNCTIONS
      // ----------------------------------------------------------------------
      topic_5: [
        // --- QUIZ ---
        { id: 't5_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Definition Keyword', questionText: 'Which keyword defines a function in Python?', options: ['def', 'function', 'fn', 'define'], correctAnswer: 'def', explanation: 'def is used to declare user-defined functions.' },
        { id: 't5_q2', challengeType: 'Quiz', difficulty: 'easy', title: 'Return Keyword', questionText: 'Which keyword passes values back from a function to the caller?', options: ['return', 'send', 'output', 'give'], correctAnswer: 'return', explanation: 'return terminates function execution and returns a result value.' },
        { id: 't5_q3', challengeType: 'Quiz', difficulty: 'medium', title: 'Variable Scope', questionText: 'Where are variables declared inside a function accessible?', options: ['Only inside that function (Local scope)', 'Globally everywhere', 'Only in other files', 'Nowhere'], correctAnswer: 'Only inside that function (Local scope)', explanation: 'Variables created inside functions have local scope.' },
        { id: 't5_q4', challengeType: 'Quiz', difficulty: 'medium', title: 'Default Arguments', questionText: 'What are default function parameters used for?', options: ['Providing fallback values if arguments are omitted', 'Speeding up execution', 'Making global variables', 'Restricting inputs'], correctAnswer: 'Providing fallback values if arguments are omitted', explanation: 'Default arguments provide fallback values when callers omit parameters.' },
        { id: 't5_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Implicit Return', questionText: 'What does a function return by default if no return statement is specified?', options: ['None', '0', 'False', 'Undefined'], correctAnswer: 'None', explanation: 'Functions without a return statement implicitly return None.' },

        // --- OUTPUT PREDICTION ---
        { id: 't5_op1', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Return Output', codeSnippet: 'def add(a, b):\n    return a + b\nprint(add(4, 5))', questionText: 'What does this code print?', options: ['9', '45', 'None', 'Error'], correctAnswer: '9', explanation: 'Returns the sum of 4 + 5, which is 9.' },
        { id: 't5_op2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Default Parameter', codeSnippet: 'def greet(name="User"):\n    return "Hi " + name\nprint(greet())', questionText: 'What does this code print?', options: ['Hi User', 'Hi None', 'Error', 'User'], correctAnswer: 'Hi User', explanation: 'Uses default parameter "User" since no argument was passed.' },
        { id: 't5_op3', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Early Return', codeSnippet: 'def test():\n    print("A")\n    return\n    print("B")\ntest()', questionText: 'What does this code print?', options: ['A', 'A B', 'B', 'None'], correctAnswer: 'A', explanation: 'The return statement terminates execution before reaching print("B").' },
        { id: 't5_op4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Square Function', codeSnippet: 'def square(x):\n    return x * x\nprint(square(4))', questionText: 'What does this code print?', options: ['16', '8', '4', 'Error'], correctAnswer: '16', explanation: '4 * 4 evaluates to 16.' },
        { id: 't5_op5', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Implicit None', codeSnippet: 'def display_msg():\n    print("Hello")\n\nx = display_msg()\nprint(x)', questionText: 'What does this code print for x?', options: ['None', 'Hello', 'Error', '0'], correctAnswer: 'None', explanation: 'Functions without explicit return statements return None.' },

        // --- BUG-FIX ---
        { id: 't5_bf1', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This function is missing a return statement. How do you fix line 2?', codeSnippet: '1  def get_double(x):\n2      result = x * 2\n3  print(get_double(5))', errorText: 'Returns None', options: ['return result', 'print(result)', 'result = return', 'output result'], correctAnswer: 'return result', explanation: 'Functions must return values explicitly using the return keyword.' },
        { id: 't5_bf2', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Squash that bug', questionText: 'This function header is missing a colon. How do you fix line 1?', codeSnippet: '1  def calculate_sum(a, b)\n2      return a + b', errorText: 'SyntaxError: expected \':\'', options: ['def calculate_sum(a, b):', 'def calculate_sum(a, b)->', 'def (a, b) calculate_sum:', 'def: calculate_sum(a, b)'], correctAnswer: 'def calculate_sum(a, b):', explanation: 'Function signatures must end with a colon (:).' },
        { id: 't5_bf3', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Squash that bug', questionText: 'This script calls a function before defining it. How do you reorder lines 1 and 2?', codeSnippet: '1  print(say_hi())\n2  def say_hi():', errorText: 'NameError: name \'say_hi\' is not defined', options: ['Swap lines so definition comes first', 'Indent print statement', 'Add global keyword', 'Remove parentheses'], correctAnswer: 'Swap lines so definition comes first', explanation: 'Functions must be declared in memory before they are invoked.' },
        { id: 't5_bf4', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'Parameters in this function header lack a comma separator. Fix line 1:', codeSnippet: '1  def multiply(a b):\n2      return a * b', errorText: 'SyntaxError: invalid syntax', options: ['def multiply(a, b):', 'def multiply(a and b):', 'def multiply(a; b):', 'def multiply(a b):'], correctAnswer: 'def multiply(a, b):', explanation: 'Multiple function parameters must be separated by commas.' },
        { id: 't5_bf5', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Squash that bug', questionText: 'This code tries to access a local function variable outside. How do you fix line 2?', codeSnippet: '1  def test():\n2      val = 10\n3  print(val)', errorText: 'NameError: name \'val\' is not defined', options: ['Return val from test()', 'Make val global', 'Print inside function', 'Both A and C'], correctAnswer: 'Both A and C', explanation: 'Local variables cannot be accessed outside their function scope unless returned.' },
      ]

    };

    // ==========================================================================
    // 3. UPLOAD QUESTIONS INTO FIRESTORE SUB-COLLECTIONS
    // ==========================================================================
    for (const [topicId, questions] of Object.entries(questionPool)) {
      for (const q of questions) {
        await setDoc(doc(db, 'topics', topicId, 'questions', q.id), q);
      }
    }

    console.log("🎉 Successfully seeded Firestore with distinct, non-repeating mode questions!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}