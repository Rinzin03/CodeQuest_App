// ============================================================================
// CODEQUEST DEDICATED MULTI-MODE SEEDING SCRIPT
// Ensures Quiz, Output Prediction, and Bug-Fix have completely separate questions.
// ============================================================================

import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function seedExpandedCodeQuestDatabase() {
  try {
    console.log("Seeding distinct mode questions...");

    // 1. TOPICS DATA
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

    // 2. DEDICATED QUESTION POOL FOR ALL 5 TOPICS & 3 MODES
    const questionPool = {
      // ----------------------------------------------------------------------
      // TOPIC 1: HELLO PYTHON
      // ----------------------------------------------------------------------
      topic_1: [
        // --- QUIZ MODE (Conceptual Theory) ---
        { id: 't1_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Basic Output Function', questionText: 'Which built-in function outputs text to the console in Python?', options: ['print()', 'echo()', 'write()', 'display()'], correctAnswer: 'print()', explanation: 'print() is the standard Python output function.' },
        { id: 't1_q2', challengeType: 'Quiz', difficulty: 'easy', title: 'String Literals', questionText: 'How must text strings be enclosed in Python?', options: ['Single or double quotes', 'Curly braces', 'Angle brackets', 'Parentheses only'], correctAnswer: 'Single or double quotes', explanation: 'Python accepts single (\'\') or double ("") quotes for strings.' },

        // --- OUTPUT PREDICTION MODE (Predict exact result) ---
        { id: 't1_q3', challengeType: 'Output Prediction', difficulty: 'easy', title: 'String Concatenation', codeSnippet: 'print("Code" + "Quest")', questionText: 'What will be the output of this code snippet?', options: ['CodeQuest', 'Code Quest', 'Error', 'Code+Quest'], correctAnswer: 'CodeQuest', explanation: 'The + operator joins strings directly without spaces.' },
        { id: 't1_q4', challengeType: 'Output Prediction', difficulty: 'medium', title: 'String Multiplication', codeSnippet: 'print("Py" * 3)', questionText: 'What is printed to the screen?', options: ['PyPyPy', 'Py3', 'Error', 'Py Py Py'], correctAnswer: 'PyPyPy', explanation: 'Multiplying a string by an integer repeats it.' },

        // --- BUG-FIX MODE (Identify & Fix the syntax error) ---
        { id: 't1_q5', challengeType: 'Bug-Fix', difficulty: 'easy', title: 'Spelling Error in Output', codeSnippet: 'prnt("Hello World")', questionText: 'Which option fixes the NameError in this code?', options: ['print("Hello World")', 'echo("Hello World")', 'console.log("Hello World")'], correctAnswer: 'print("Hello World")', explanation: 'Fix the typo "prnt" to "print".' },
        { id: 't1_q6', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Unclosed String Quote', codeSnippet: 'print("Hello Python)', questionText: 'How do you fix the SyntaxError in this statement?', options: ['print("Hello Python")', 'print(\'Hello Python")', 'print(Hello Python)'], correctAnswer: 'print("Hello Python")', explanation: 'Strings must have matching opening and closing quotes.' },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 2: VARIABLES
      // ----------------------------------------------------------------------
      topic_2: [
        // --- QUIZ MODE ---
        { id: 't2_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Variable Naming Rules', questionText: 'Which of the following is an INVALID variable name in Python?', options: ['1st_player', 'player_1', '_score', 'playerOne'], correctAnswer: '1st_player', explanation: 'Variable names cannot start with a digit.' },
        { id: 't2_q2', challengeType: 'Quiz', difficulty: 'medium', title: 'Division Data Type', questionText: 'What data type is returned by the division operator (/) in Python 3?', options: ['float', 'int', 'str', 'bool'], correctAnswer: 'float', explanation: 'Division using / always yields a floating-point number.' },

        // --- OUTPUT PREDICTION MODE ---
        { id: 't2_q3', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Variable Reassignment', codeSnippet: 'x = 10\nx = x + 5\nprint(x)', questionText: 'What value is stored and printed for x?', options: ['15', '10', '5', 'Error'], correctAnswer: '15', explanation: 'x starts at 10, then 5 is added, resulting in 15.' },
        { id: 't2_q4', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Multiple Variables', codeSnippet: 'a = 2\nb = 3\nprint(a * b + a)', questionText: 'Predict the calculated output:', options: ['8', '6', '10', ' Error'], correctAnswer: '8', explanation: 'Multiplication happens first: (2 * 3) + 2 = 8.' },

        // --- BUG-FIX MODE ---
        { id: 't2_q5', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Case Sensitivity Bug', codeSnippet: 'user_score = 100\nprint(User_score)', questionText: 'Fix the NameError caused by case sensitivity:', options: ['print(user_score)', 'print("User_score")', 'user_score = User_score'], correctAnswer: 'print(user_score)', explanation: 'Python is case-sensitive; user_score and User_score are different.' },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 3: CONDITIONALS
      // ----------------------------------------------------------------------
      topic_3: [
        // --- QUIZ MODE ---
        { id: 't3_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Elif Keyword', questionText: 'Which keyword handles secondary conditions in Python?', options: ['elif', 'else if', 'elseif', 'then'], correctAnswer: 'elif', explanation: 'Python uses elif instead of else if.' },

        // --- OUTPUT PREDICTION MODE ---
        { id: 't3_q2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'If-Else Evaluation', codeSnippet: 'score = 75\nif score >= 50:\n    print("Pass")\nelse:\n    print("Fail")', questionText: 'What output will be displayed?', options: ['Pass', 'Fail', '75', 'Error'], correctAnswer: 'Pass', explanation: '75 >= 50 is True, so the if block executes.' },

        // --- BUG-FIX MODE ---
        { id: 't3_q3', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Missing Colon in If Statement', codeSnippet: 'if age >= 18\n    print("Adult")', questionText: 'Select the fix for this SyntaxError:', options: ['if age >= 18:', 'if (age >= 18)', 'if age >= 18 then:'], correctAnswer: 'if age >= 18:', explanation: 'Conditionals in Python require a colon (:) at the end of the line.' },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 4: LOOPS
      // ----------------------------------------------------------------------
      topic_4: [
        // --- QUIZ MODE ---
        { id: 't4_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Loop Exit Keyword', questionText: 'Which statement immediately terminates a loop?', options: ['break', 'stop', 'exit', 'continue'], correctAnswer: 'break', explanation: 'break immediately exits the active loop body.' },

        // --- OUTPUT PREDICTION MODE ---
        { id: 't4_q2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Range Function Output', codeSnippet: 'for i in range(3):\n    print(i, end=" ")', questionText: 'What numbers are printed by this range loop?', options: ['0 1 2', '1 2 3', '0 1 2 3', '3'], correctAnswer: '0 1 2', explanation: 'range(3) generates numbers 0, 1, and 2.' },

        // --- BUG-FIX MODE ---
        { id: 't4_q3', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Infinite While Loop', codeSnippet: 'count = 0\nwhile count < 3:\n    print(count)', questionText: 'How do you fix this infinite loop?', options: ['Add count += 1 inside the loop', 'Change count < 3 to count > 3', 'Remove count = 0'], correctAnswer: 'Add count += 1 inside the loop', explanation: 'Incrementing the counter ensures the while condition becomes false.' },
      ],

      // ----------------------------------------------------------------------
      // TOPIC 5: FUNCTIONS
      // ----------------------------------------------------------------------
      topic_5: [
        // --- QUIZ MODE ---
        { id: 't5_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Function Definition Keyword', questionText: 'Which keyword is used to define a function in Python?', options: ['def', 'function', 'fn', 'define'], correctAnswer: 'def', explanation: 'def declares a function definition.' },

        // --- OUTPUT PREDICTION MODE ---
        { id: 't5_q2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Return Statement Output', codeSnippet: 'def add(a, b):\n    return a + b\nprint(add(4, 5))', questionText: 'What is printed by calling add(4, 5)?', options: ['9', '45', 'None', 'Error'], correctAnswer: '9', explanation: 'The function returns 4 + 5, which evaluates to 9.' },

        // --- BUG-FIX MODE ---
        { id: 't5_q3', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Missing Return Keyword', codeSnippet: 'def get_double(x):\n    result = x * 2\n\nprint(get_double(5))', questionText: 'Why does this print None, and how do you fix it?', options: ['Add "return result" inside get_double', 'Change print to output', 'Remove x parameter'], correctAnswer: 'Add "return result" inside get_double', explanation: 'Functions without an explicit return statement return None by default.' },
      ]
    };

    // 3. SEED SUB-COLLECTIONS
    for (const [topicId, questions] of Object.entries(questionPool)) {
      for (const q of questions) {
        await setDoc(doc(db, 'topics', topicId, 'questions', q.id), q);
      }
    }

    console.log("🎉 All modes seeded with unique questions!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}