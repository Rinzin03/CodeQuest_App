// ============================================================================
// CODEQUEST DEDICATED MULTI-MODE SEEDING SCRIPT
// Populates 5 distinct questions per mode (Quiz, Output Prediction, Bug-Fix) 
// matching your Figma UI designs with code snippets and error feedback.
// ============================================================================

import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function seedExpandedCodeQuestDatabase() {
  try {
    console.log("Seeding distinct mode questions across all topics...");

    // 1. TOPICS METADATA DEFINITION
    const topics = [
      { id: 'topic_1', title: 'Hello Python', description: 'print() & strings', order: 1 },
      { id: 'topic_2', title: 'Variables', description: 'names & values', order: 2 },
      { id: 'topic_3', title: 'Conditionals', description: 'if, elif, else', order: 3 },
      { id: 'topic_4', title: 'Loops', description: 'for & while loops', order: 4 },
      { id: 'topic_5', title: 'Functions', description: 'def & return', order: 5 },
    ];

    for (const topic of topics) {
      await setDoc(doc(db, 'topics', topic.id), topic);
    }

    // 2. COMPREHENSIVE QUESTION POOL (5 Quiz, 5 Predictions, 5 Bug-Fixes per topic)
    const questionPool = {
      
      // ----------------------------------------------------------------------
      // TOPIC 1: HELLO PYTHON
      // ----------------------------------------------------------------------
      topic_1: [
        // --- QUIZ MODE (5 Theory Questions) ---
        { id: 't1_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Basic Output Function', questionText: 'Which built-in function outputs text to the console in Python?', options: ['print()', 'echo()', 'write()', 'display()'], correctAnswer: 'print()', explanation: 'print() is the standard Python output function.' },
        { id: 't1_q2', challengeType: 'Quiz', difficulty: 'easy', title: 'String Literals', questionText: 'How must text strings be enclosed in Python?', options: ['Single or double quotes', 'Curly braces', 'Angle brackets', 'Parentheses only'], correctAnswer: 'Single or double quotes', explanation: 'Python accepts single (\'\') or double ("") quotes for strings.' },
        { id: 't1_q3', challengeType: 'Quiz', difficulty: 'medium', title: 'Case Sensitivity', questionText: 'Is Python case-sensitive when naming functions like print?', options: ['Yes', 'No', 'Only for variables', 'Only on Windows'], correctAnswer: 'Yes', explanation: 'Python is strictly case-sensitive (e.g., Print won\'t work).' },
        { id: 't1_q4', challengeType: 'Quiz', difficulty: 'medium', title: 'Comments Symbol', questionText: 'Which symbol is used to write single-line comments in Python?', options: ['#', '//', '/*', '<!--'], correctAnswer: '#', explanation: 'The hash symbol (#) denotes a comment in Python.' },
        { id: 't1_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Extension Format', questionText: 'What is the standard file extension for Python source files?', options: ['.py', '.pt', '.python', '.pyt'], correctAnswer: '.py', explanation: 'Python scripts use the .py file extension.' },

        // --- OUTPUT PREDICTION MODE (5 Code Execution Predictions) ---
        { id: 't1_op1', challengeType: 'Output Prediction', difficulty: 'easy', title: 'String Concatenation', codeSnippet: 'print("Code" + "Quest")', questionText: 'What does this code print?', options: ['CodeQuest', 'Code Quest', 'Error', 'Code+Quest'], correctAnswer: 'CodeQuest', explanation: 'The + operator joins strings directly without spaces.' },
        { id: 't1_op2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'String Multiplication', codeSnippet: 'print("Py" * 3)', questionText: 'What does this code print?', options: ['PyPyPy', 'Py3', 'Error', 'Py Py Py'], correctAnswer: 'PyPyPy', explanation: 'Multiplying a string by an integer repeats it.' },
        { id: 't1_op3', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Escape Sequences', codeSnippet: 'print("Hello\\nWorld")', questionText: 'What does this code print?', options: ['New line', 'Tab space', 'Backslash', 'Nothing'], correctAnswer: 'New line', explanation: '\\n inserts a newline break in strings.' },
        { id: 't1_op4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Combined Quotes', codeSnippet: 'print("It\'s Python")', questionText: 'What does this code print?', options: ["It's Python", "It\\'s Python", 'Error', 'Python'], correctAnswer: "It's Python", explanation: 'The backslash escapes the single quote inside double quotes.' },
        { id: 't1_op5', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Multiple Arguments', codeSnippet: 'print("Python", "is", "fun")', questionText: 'What does this code print?', options: ['Python is fun', 'Python,is,fun', 'Pythonisdun', 'Error'], correctAnswer: 'Python is fun', explanation: 'print() separates multiple comma arguments with a space by default.' },

        // --- BUG-FIX MODE (5 Bug Squashing Challenges with Terminal Error Display) ---
        { 
          id: 't1_bf1', 
          challengeType: 'Bug-Fix', 
          difficulty: 'easy', 
          title: 'Squash that bug', 
          questionText: 'This code raises a NameError. Which line 1 replacement fixes it?', 
          codeSnippet: '1  prnt("Hello World")', 
          errorText: 'NameError: name \'prnt\' is not defined',
          options: ['print("Hello World")', 'echo("Hello World")', 'console.log("Hello World")', 'display("Hello World")'], 
          correctAnswer: 'print("Hello World")', 
          explanation: 'Fix the typo "prnt" to "print".' 
        },
        { 
          id: 't1_bf2', 
          challengeType: 'Bug-Fix', 
          difficulty: 'medium', 
          title: 'Squash that bug', 
          questionText: 'This code raises a SyntaxError. Which replacement fixes it?', 
          codeSnippet: '1  print("Hello Python)', 
          errorText: 'SyntaxError: unterminated string literal',
          options: ['print("Hello Python")', 'print(\'Hello Python")', 'print(Hello Python)', 'print("Hello Python"'], 
          correctAnswer: 'print("Hello Python")', 
          explanation: 'Strings must have matching opening and closing quotes.' 
        },
        { 
          id: 't1_bf3', 
          challengeType: 'Bug-Fix', 
          difficulty: 'medium', 
          title: 'Squash that bug', 
          questionText: 'Python 3 requires parentheses. Which replacement fixes this?', 
          codeSnippet: '1  print "Hello World"', 
          errorText: 'SyntaxError: Missing parentheses in call to \'print\'',
          options: ['print("Hello World")', 'print("Hello World");', 'print{Hello World}', 'echo("Hello World")'], 
          correctAnswer: 'print("Hello World")', 
          explanation: 'Python 3 requires parentheses around print arguments.' 
        },
        { 
          id: 't1_bf4', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This code has mismatched parentheses. How do you fix it?', 
          codeSnippet: '1  print("Hello" ))', 
          errorText: 'SyntaxError: unmatched \')\'',
          options: ['print("Hello")', 'print(("Hello")', 'print "Hello"', 'print("Hello))'], 
          correctAnswer: 'print("Hello")', 
          explanation: 'Remove the extra closing parenthesis.' 
        },
        { 
          id: 't1_bf5', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This code references an undefined variable. How do you fix it?', 
          codeSnippet: '1  print(greeting)', 
          errorText: 'NameError: name \'greeting\' is not defined',
          options: ['greeting = "Hi"\nprint(greeting)', 'print("greeting")', 'print(str(greeting))', 'def greeting():'], 
          correctAnswer: 'greeting = "Hi"\nprint(greeting)', explanation: 'Variables must be assigned values before being referenced.' 
        },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 2: VARIABLES
      // ----------------------------------------------------------------------
      topic_2: [
        // --- QUIZ ---
        { id: 't2_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Variable Naming Rules', questionText: 'Which of the following is an INVALID variable name in Python?', options: ['1st_player', 'player_1', '_score', 'playerOne'], correctAnswer: '1st_player', explanation: 'Variable names cannot start with a digit.' },
        { id: 't2_q2', challengeType: 'Quiz', difficulty: 'medium', title: 'Division Data Type', questionText: 'What data type is returned by the division operator (/) in Python 3?', options: ['float', 'int', 'str', 'bool'], correctAnswer: 'float', explanation: 'Division using / always yields a floating-point number.' },
        { id: 't2_q3', challengeType: 'Quiz', difficulty: 'medium', title: 'Dynamic Typing', questionText: 'Can a Python variable change its data type after being assigned?', options: ['Yes', 'No', 'Only integers', 'Only strings'], correctAnswer: 'Yes', explanation: 'Python is dynamically typed, so variables can reference different types.' },
        { id: 't2_q4', challengeType: 'Quiz', difficulty: 'hard', title: 'Assignment Operator', questionText: 'Which symbol is used to assign values to variables in Python?', options: ['=', '==', '->', ':='], correctAnswer: '=', explanation: 'The single equals sign (=) is the assignment operator.' },
        { id: 't2_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Keyword Restriction', questionText: 'Which of the following cannot be used as a variable name?', options: ['class', 'my_class', 'class_name', 'klass'], correctAnswer: 'class', explanation: 'Python reserved keywords like class, for, and def cannot be used as variable names.' },

        // --- OUTPUT PREDICTION ---
        { id: 't2_op1', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Variable Reassignment', codeSnippet: 'coins = 3\ncoins = coins + 2\nprint(coins)', questionText: 'What does this code print?', options: ['5', '3', '32', 'coins'], correctAnswer: '5', explanation: 'coins starts at 3, then 2 is added, resulting in 5.' },
        { id: 't2_op2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Multiple Variables', codeSnippet: 'a = 2\nb = 3\nprint(a * b + a)', questionText: 'What does this code print?', options: ['8', '6', '10', 'Error'], correctAnswer: '8', explanation: 'Multiplication happens first: (2 * 3) + 2 = 8.' },
        { id: 't2_op3', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Type Reassignment', codeSnippet: 'x = "Hello"\nx = 5\nprint(x)', questionText: 'What does this code print?', options: ['5', 'Hello', 'Error', 'Hello5'], correctAnswer: '5', explanation: 'x is reassigned from a string to an integer.' },
        { id: 't2_op4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Tuple Assignment', codeSnippet: 'x, y = 5, 10\nprint(x + y)', questionText: 'What does this code print?', options: ['15', '510', 'Error', '5'], correctAnswer: '15', explanation: 'x becomes 5 and y becomes 10, summing to 15.' },
        { id: 't2_op5', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Float Type Inspection', codeSnippet: 'pi = 3.14\nprint(type(pi))', questionText: 'What does this code print?', options: ["<class 'float'>", "<class 'int'>", "<class 'str'>", "<class 'double'>"], correctAnswer: "<class 'float'>", explanation: 'Numbers with decimals are classified as float.' },

        // --- BUG-FIX ---
        { 
          id: 't2_bf1', 
          challengeType: 'Bug-Fix', 
          difficulty: 'easy', 
          title: 'Squash that bug', 
          questionText: 'This code raises a NameError. Which line 2 replacement fixes it?', 
          codeSnippet: '1  name = "Maya"\n2  print(Name)', 
          errorText: 'NameError: name \'Name\' is not defined',
          options: ['print(name)', 'print("Name")', 'print(NAME)', 'print(\'Maya\')'], 
          correctAnswer: 'print(name)', 
          explanation: 'Python is case-sensitive. name and Name are different names.' 
        },
        { 
          id: 't2_bf2', 
          challengeType: 'Bug-Fix', 
          difficulty: 'medium', 
          title: 'Squash that bug', 
          questionText: 'This code references score before assignment. How do you fix line 1?', 
          codeSnippet: '1  print(score)\n2  score = 50', 
          errorText: 'NameError: name \'score\' is not defined',
          options: ['score = 50\nprint(score)', 'print(score = 50)', 'score == 50', 'global score'], 
          correctAnswer: 'score = 50\nprint(score)', 
          explanation: 'Variables must be defined before they are accessed.' 
        },
        { 
          id: 't2_bf3', 
          challengeType: 'Bug-Fix', 
          difficulty: 'medium', 
          title: 'Squash that bug', 
          questionText: 'This code uses a reserved keyword as a variable name. How do you fix it?', 
          codeSnippet: '1  for = 10\n2  print(for)', 
          errorText: 'SyntaxError: invalid syntax',
          options: ['num_for = 10', 'print(for)', 'for_loop = 10', 'define for = 10'], 
          correctAnswer: 'num_for = 10', 
          explanation: 'Reserved keywords cannot be variable names.' 
        },
        { 
          id: 't2_bf4', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This assignment is incomplete. How do you fix line 1?', 
          codeSnippet: '1  total_score = ', 
          errorText: 'SyntaxError: unexpected EOF while parsing',
          options: ['total_score = 100', 'total_score == 100', 'print(total_score)', 'total_score ='], 
          correctAnswer: 'total_score = 100', 
          explanation: 'Assignment operator needs a value on the right side.' 
        },
        { 
          id: 't2_bf5', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This code raises a TypeError. Which replacement fixes it?', 
          codeSnippet: '1  print("Age: " + 25)', 
          errorText: 'TypeError: can only concatenate str (not "int") to str',
          options: ['print("Age: " + str(25))', 'print("Age: ", 25)', 'Both A and B', 'print(str("Age: ") + 25)'], 
          correctAnswer: 'Both A and B', 
          explanation: 'You cannot concatenate strings and ints directly with +, use str() or commas.' 
        },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 3: CONDITIONALS
      // ----------------------------------------------------------------------
      topic_3: [
        { id: 't3_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Elif Keyword', questionText: 'Which keyword handles secondary conditions in Python?', options: ['elif', 'else if', 'elseif', 'then'], correctAnswer: 'elif', explanation: 'Python uses elif instead of else if.' },
        { id: 't3_q2', challengeType: 'Quiz', difficulty: 'easy', title: 'Equality Comparison', questionText: 'Which operator checks if two values are equal in Python?', options: ['==', '=', '===', 'equals'], correctAnswer: '==', explanation: '== is the equality comparison operator.' },
        { id: 't3_q3', challengeType: 'Quiz', difficulty: 'medium', title: 'Logical Operator', questionText: 'Which keyword represents logical conjunction (both conditions must be true)?', options: ['and', 'or', 'not', '&'], correctAnswer: 'and', explanation: 'The and keyword evaluates whether both expressions are true.' },
        { id: 't3_q4', challengeType: 'Quiz', difficulty: 'medium', title: 'Indentation Importance', questionText: 'How does Python identify blocks of code inside conditional statements?', options: ['Indentation (Whitespace)', 'Curly braces {}', 'Parentheses ()', 'Semicolons'], correctAnswer: 'Indentation (Whitespace)', explanation: 'Python relies heavily on indentation to structure code blocks.' },
        { id: 't3_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Boolean Evaluation', questionText: 'What are the two possible boolean values in Python?', options: ['True and False', 'yes and no', '1 and 0', 'ON and OFF'], correctAnswer: 'True and False', explanation: 'Booleans in Python are capitalized True and False.' },

        { id: 't3_op1', challengeType: 'Output Prediction', difficulty: 'medium', title: 'If-Else Evaluation', codeSnippet: 'score = 75\nif score >= 50:\n    print("Pass")\nelse:\n    print("Fail")', questionText: 'What does this code print?', options: ['Pass', 'Fail', '75', 'Error'], correctAnswer: 'Pass', explanation: '75 >= 50 is True, so the if block executes.' },
        { id: 't3_op2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Ternary Operator', codeSnippet: 'x = 10\nprint("Yes" if x > 5 else "No")', questionText: 'What does this code print?', options: ['Yes', 'No', '10', 'Error'], correctAnswer: 'Yes', explanation: '10 > 5 is True, so "Yes" is returned.' },
        { id: 't3_op3', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Elif Branching', codeSnippet: 'x = 20\nif x > 30:\n    print("A")\nelif x > 15:\n    print("B")\nelse:\n    print("C")', questionText: 'What does this code print?', options: ['B', 'A', 'C', 'Error'], correctAnswer: 'B', explanation: 'x > 30 is False, but x > 15 is True.' },
        { id: 't3_op4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Logical And Evaluation', codeSnippet: 'x = 10\nprint(x > 5 and x < 15)', questionText: 'What does this code print?', options: ['True', 'False', '10', 'Error'], correctAnswer: 'True', explanation: 'Both conditions (10 > 5 and 10 < 15) are true.' },
        { id: 't3_op5', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Basic If Statement', codeSnippet: 'if True:\n    print("A")', questionText: 'What does this code print?', options: ['A', 'True', 'False', 'Error'], correctAnswer: 'A', explanation: 'The condition is True, so print executes.' },

        { 
          id: 't3_bf1', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This code raises a SyntaxError. Which replacement fixes line 1?', 
          codeSnippet: '1  if age >= 18\n2      print("Adult")', 
          errorText: 'SyntaxError: expected \':\'',
          options: ['if age >= 18:', 'if (age >= 18)', 'if age >= 18 then:', 'if: age >= 18'], 
          correctAnswer: 'if age >= 18:', 
          explanation: 'Conditionals in Python require a colon (:) at the end of the line.' 
        },
        { 
          id: 't3_bf2', 
          challengeType: 'Bug-Fix', 
          difficulty: 'medium', 
          title: 'Squash that bug', 
          questionText: 'This condition uses an assignment operator instead of comparison. How do you fix line 1?', 
          codeSnippet: '1  if x = 5:\n2      print("Equal")', 
          errorText: 'SyntaxError: invalid syntax',
          options: ['if x == 5:', 'if x equals 5:', 'if(x := 5):', 'if x: 5'], 
          correctAnswer: 'if x == 5:', 
          explanation: 'Use == for comparison instead of =.' 
        },
        { 
          id: 't3_bf3', 
          challengeType: 'Bug-Fix', 
          difficulty: 'medium', 
          title: 'Squash that bug', 
          questionText: 'This code raises an IndentationError. How do you fix line 2?', 
          codeSnippet: '1  if True:\n2  print("Hello")', 
          errorText: 'IndentationError: expected an indented block',
          options: ['    print("Hello")', 'print("Hello")', 'print(True)', 'tab print("Hello")'], 
          correctAnswer: '    print("Hello")', 
          explanation: 'Code blocks following colons must be indented.' 
        },
        { 
          id: 't3_bf4', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This code uses an invalid logical operator. How do you fix line 1?', 
          codeSnippet: '1  if x > 5 & x < 10:', 
          errorText: 'TypeError: unsupported operand type(s)',
          options: ['if x > 5 and x < 10:', 'if x > 5 && x < 10:', 'if x > 5 || x < 10:', 'if (x > 5) (x < 10):'], 
          correctAnswer: 'if x > 5 and x < 10:', 
          explanation: 'Python uses the keyword `and` instead of `&` for boolean logic.' 
        },
        { 
          id: 't3_bf5', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This conditional has unmatched parentheses. How do you fix line 1?', 
          codeSnippet: '1  if (score >= 50:', 
          errorText: 'SyntaxError: unmatched \')\' or missing \')\'',
          options: ['if score >= 50:', 'if score >= 50)', 'if (score >= 50):', 'if score == 50:'], 
          correctAnswer: 'if (score >= 50):', 
          explanation: 'Parentheses must be properly closed and followed by a colon.' 
        },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 4: LOOPS
      // ----------------------------------------------------------------------
      topic_4: [
        { id: 't4_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Loop Exit Keyword', questionText: 'Which statement immediately terminates a loop?', options: ['break', 'stop', 'exit', 'continue'], correctAnswer: 'break', explanation: 'break immediately exits the active loop body.' },
        { id: 't4_q2', challengeType: 'Quiz', difficulty: 'easy', title: 'Loop Skip Keyword', questionText: 'Which keyword skips the current iteration and jumps to the next loop cycle?', options: ['continue', 'skip', 'next', 'pass'], correctAnswer: 'continue', explanation: 'continue skips the rest of the current iteration.' },
        { id: 't4_q3', challengeType: 'Quiz', difficulty: 'medium', title: 'Range Function Purpose', questionText: 'What does range(5) generate in Python?', options: ['Numbers from 0 to 4', 'Numbers from 1 to 5', 'Numbers from 0 to 5', 'A list of 5 random numbers'], correctAnswer: 'Numbers from 0 to 4', explanation: 'range(n) starts at 0 and counts up to n-1.' },
        { id: 't4_q4', challengeType: 'Quiz', difficulty: 'medium', title: 'Loop Type Choice', questionText: 'When should you typically use a while loop instead of a for loop?', options: ['When looping based on an indefinite condition', 'When iterating over a list', 'When running a fixed number of times', 'When speed is required'], correctAnswer: 'When looping based on an indefinite condition', explanation: 'While loops run as long as a boolean condition remains true.' },
        { id: 't4_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Loop Else Clause', questionText: 'When does the optional else clause of a loop execute?', options: ['When the loop finishes normally without a break', 'Whenever the loop breaks', 'Before the loop starts', 'Only on error'], correctAnswer: 'When the loop finishes normally without a break', explanation: 'A loop else block runs if no break statement was triggered.' },

        { id: 't4_op1', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Range Function Output', codeSnippet: 'for i in range(3):\n    print(i, end=" ")', questionText: 'What does this code print?', options: ['0 1 2', '1 2 3', '0 1 2 3', '3'], correctAnswer: '0 1 2', explanation: 'range(3) generates numbers 0, 1, and 2.' },
        { id: 't4_op2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'While Loop Count', codeSnippet: 'x = 0\nwhile x < 2:\n    print(x, end="")\n    x += 1', questionText: 'What does this code print?', options: ['01', '012', '12', '02'], correctAnswer: '01', explanation: 'x starts at 0, prints 0, increments to 1, prints 1, then stops.' },
        { id: 't4_op3', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Custom Range Steps', codeSnippet: 'for i in range(1, 6, 2):\n    print(i, end=" ")', questionText: 'What does this code print?', options: ['1 3 5', '1 2 3 4 5', '2 4 6', '1 4'], correctAnswer: '1 3 5', explanation: 'range starts at 1, stops before 6, with steps of 2.' },
        { id: 't4_op4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'String Iteration', codeSnippet: 'for c in "Py":\n    print(c, end="-")', questionText: 'What does this code print?', options: ['P-y-', 'Py-', 'P-y', '-P-y'], correctAnswer: 'P-y-', explanation: 'Iterates through each character P and y with separator.' },
        { id: 't4_op5', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Simple For Loop', codeSnippet: 'for i in range(2):\n    print("Hi")', questionText: 'How many times does this loop print?', options: ['2', '1', '3', '0'], correctAnswer: '2', explanation: 'range(2) iterates 2 times (0 and 1).' },

        { 
          id: 't4_bf1', 
          challengeType: 'Bug-Fix', 
          difficulty: 'medium', 
          title: 'Squash that bug', 
          questionText: 'This while loop creates an infinite loop. Which replacement fixes line 3?', 
          codeSnippet: '1  count = 0\n2  while count < 3:\n3      print(count)', 
          errorText: 'RuntimeError: Infinite Loop Detected',
          options: ['count += 1', 'count = 3', 'break', 'continue'], 
          correctAnswer: 'count += 1', 
          explanation: 'Incrementing the counter ensures the while condition becomes false.' 
        },
        { 
          id: 't4_bf2', 
          challengeType: 'Bug-Fix', 
          difficulty: 'medium', 
          title: 'Squash that bug', 
          questionText: 'This for loop is missing its colon. How do you fix line 1?', 
          codeSnippet: '1  for i in range(5)\n2      print(i)', 
          errorText: 'SyntaxError: expected \':\'',
          options: ['for i in range(5):', 'for (i in range(5)):', 'for i = 0 to 5:', 'for i in range(5) then:'], 
          correctAnswer: 'for i in range(5):', 
          explanation: 'Loops in Python require a colon (:) at the end of their header.' 
        },
        { 
          id: 't4_bf3', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This code raises a SyntaxError. How do you fix line 2?', 
          codeSnippet: '1  print("Hello")\n2  break', 
          errorText: 'SyntaxError: \'break\' outside loop',
          options: ['Remove break or wrap in a loop', 'Change break to continue', 'Add a colon', 'Indent line 2'], 
          correctAnswer: 'Remove break or wrap in a loop', 
          explanation: 'The break keyword is exclusively used inside for or while loops.' 
        },
        { 
          id: 't4_bf4', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This loop body has an IndentationError. How do you fix line 2?', 
          codeSnippet: '1  for i in range(3):\n2  print(i)', 
          errorText: 'IndentationError: expected an indented block',
          options: ['    print(i)', 'print(i)', 'tab print(i)', 'i = print(i)'], 
          correctAnswer: '    print(i)', 
          explanation: 'Statements inside loops must be indented.' 
        },
        { 
          id: 't4_bf5', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This range function receives a string instead of an int. How do you fix line 1?', 
          codeSnippet: '1  for i in range("5"):', 
          errorText: 'TypeError: \'str\' object cannot be interpreted as an integer',
          options: ['for i in range(int("5")):', 'for i in range(5):', 'Both A and B', 'for i in range(range(5)):'], 
          correctAnswer: 'Both A and B', 
          explanation: 'range() only accepts integers as arguments.' 
        },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 5: FUNCTIONS
      // ----------------------------------------------------------------------
      topic_5: [
        { id: 't5_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Function Definition Keyword', questionText: 'Which keyword is used to define a function in Python?', options: ['def', 'function', 'fn', 'define'], correctAnswer: 'def', explanation: 'def declares a function definition.' },
        { id: 't5_q2', challengeType: 'Quiz', difficulty: 'easy', title: 'Return Statement', questionText: 'Which keyword sends a value back from a function to its caller?', options: ['return', 'send', 'output', 'give'], correctAnswer: 'return', explanation: 'return exits a function and passes back a result value.' },
        { id: 't5_q3', challengeType: 'Quiz', difficulty: 'medium', title: 'Variable Scope', questionText: 'Where are variables defined inside a function accessible?', options: ['Only inside that function (Local scope)', 'Globally everywhere', 'Only in other files', 'Only in loops'], correctAnswer: 'Only inside that function (Local scope)', explanation: 'Variables created inside functions have local scope.' },
        { id: 't5_q4', challengeType: 'Quiz', difficulty: 'medium', title: 'Default Arguments', questionText: 'What are default parameters in Python functions used for?', options: ['Providing fallback values if arguments are omitted', 'Making functions run faster', 'Defining global variables', 'Restricting arguments'], correctAnswer: 'Providing fallback values if arguments are omitted', explanation: 'Default arguments give functions fallback values when callers omit them.' },
        { id: 't5_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Default Return Value', questionText: 'What does a Python function return by default if no return statement is specified?', options: ['None', '0', 'False', 'Undefined'], correctAnswer: 'None', explanation: 'Functions without explicit return statements return None implicitly.' },

        { id: 't5_op1', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Return Statement Output', codeSnippet: 'def add(a, b):\n    return a + b\nprint(add(4, 5))', questionText: 'What does this code print?', options: ['9', '45', 'None', 'Error'], correctAnswer: '9', explanation: 'The function returns 4 + 5, which evaluates to 9.' },
        { id: 't5_op2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Default Parameter Value', codeSnippet: 'def greet(name="User"):\n    return "Hi " + name\nprint(greet())', questionText: 'What does this code print?', options: ['Hi User', 'Hi None', 'Error', 'User'], correctAnswer: 'Hi User', explanation: 'Since no argument is passed, the default parameter "User" is used.' },
        { id: 't5_op3', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Early Return Behavior', codeSnippet: 'def test():\n    print("A")\n    return\n    print("B")\ntest()', questionText: 'What does this code print?', options: ['A', 'A B', 'B', 'None'], correctAnswer: 'A', explanation: 'The return statement terminates execution immediately before printing B.' },
        { id: 't5_op4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Square Function', codeSnippet: 'def square(x):\n    return x * x\nprint(square(4))', questionText: 'What does this code print?', options: ['16', '8', '4', 'Error'], correctAnswer: '16', explanation: '4 * 4 evaluates to 16.' },
        { id: 't5_op5', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Implicit None Return', codeSnippet: 'def display_msg():\n    print("Hello")\n\nx = display_msg()\nprint(x)', questionText: 'What does this code print for x?', options: ['None', 'Hello', 'Error', '0'], correctAnswer: 'None', explanation: 'Functions without a return statement return None.' },

        { 
          id: 't5_bf1', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This function is missing a return statement. How do you fix line 2?', 
          codeSnippet: '1  def get_double(x):\n2      result = x * 2\n3  print(get_double(5))', 
          errorText: 'Returns None',
          options: ['return result', 'print(result)', 'result = return', 'output result'], 
          correctAnswer: 'return result', 
          explanation: 'Functions without an explicit return statement return None by default.' 
        },
        { 
          id: 't5_bf2', 
          challengeType: 'Bug-Fix', 
          difficulty: 'medium', 
          title: 'Squash that bug', 
          questionText: 'This function header is missing a colon. How do you fix line 1?', 
          codeSnippet: '1  def calculate_sum(a, b)\n2      return a + b', 
          errorText: 'SyntaxError: expected \':\'',
          options: ['def calculate_sum(a, b):', 'def calculate_sum(a, b)->', 'def (a, b) calculate_sum:', 'def: calculate_sum(a, b)'], 
          correctAnswer: 'def calculate_sum(a, b):', 
          explanation: 'Function definitions must end with a colon (:).' 
        },
        { 
          id: 't5_bf3', 
          challengeType: 'Bug-Fix', 
          difficulty: 'medium', 
          title: 'Squash that bug', 
          questionText: 'This script calls a function before defining it. How do you reorder lines 1 and 2?', 
          codeSnippet: '1  print(say_hi())\n2  def say_hi():', 
          errorText: 'NameError: name \'say_hi\' is not defined',
          options: ['Swap lines so definition comes first', 'Indent print statement', 'Add global keyword', 'Remove parentheses'], 
          correctAnswer: 'Swap lines so definition comes first', 
          explanation: 'Functions must be defined in memory before they are invoked.' 
        },
        { 
          id: 't5_bf4', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'Parameters in this function header lack a comma separator. Fix line 1:', 
          codeSnippet: '1  def multiply(a b):\n2      return a * b', 
          errorText: 'SyntaxError: invalid syntax',
          options: ['def multiply(a, b):', 'def multiply(a and b):', 'def multiply(a; b):', 'def multiply(a b):'], 
          correctAnswer: 'def multiply(a, b):', 
          explanation: 'Multiple parameters inside a function signature must be separated by commas.' 
        },
        { 
          id: 't5_bf5', 
          challengeType: 'Bug-Fix', 
          difficulty: 'hard', 
          title: 'Squash that bug', 
          questionText: 'This code tries to access a local function variable outside. How do you fix line 2?', 
          codeSnippet: '1  def test():\n2      val = 10\n3  print(val)', 
          errorText: 'NameError: name \'val\' is not defined',
          options: ['Return val from test()', 'Make val global', 'Print inside function', 'Both A and C'], 
          correctAnswer: 'Both A and C', 
          explanation: 'Local variables are trapped inside functions unless returned.' 
        },
      ]

    };

    // 3. SEED SUB-COLLECTIONS INTO FIRESTORE
    for (const [topicId, questions] of Object.entries(questionPool)) {
      for (const q of questions) {
        await setDoc(doc(db, 'topics', topicId, 'questions', q.id), q);
      }
    }

    console.log("🎉 All 5 modes and topics successfully seeded with unique Figma-aligned questions!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}