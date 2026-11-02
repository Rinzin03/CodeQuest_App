// ============================================================================
// CODEQUEST EXPANDED FIRESTORE SEEDING SCRIPT
// Populates 5 Python topics & structured questions for all challenge modes
// ============================================================================

// Import initialized Firestore database instance from your local Firebase config file
import { db } from './firebase';
// Import essential Firestore methods to create document references and write data
import { collection, doc, setDoc } from 'firebase/firestore';

export async function seedExpandedCodeQuestDatabase() {
  try {
    console.log("Seeding expanded question pool (across 5 topics)...");

    // ------------------------------------------------------------------------
    // 1. DEFINE TOPICS ARRAY
    // Schema containing metadata for all 5 Python curriculum topics
    // ------------------------------------------------------------------------
    const topics = [
      { id: 'topic_1', title: 'Hello Python', description: 'print() & strings', order: 1 },
      { id: 'topic_2', title: 'Variables', description: 'names & values', order: 2 },
      { id: 'topic_3', title: 'Conditionals', description: 'if, elif, else', order: 3 },
      { id: 'topic_4', title: 'Loops', description: 'for & while loops', order: 4 },
      { id: 'topic_5', title: 'Functions', description: 'def & return', order: 5 },
    ];

    // Iteratively upload/overwrite each topic document in the 'topics' collection
    for (const topic of topics) {
      // doc(db, 'collectionName', 'documentId') creates a specific reference
      await setDoc(doc(db, 'topics', topic.id), topic);
    }

    // ------------------------------------------------------------------------
    // 2. QUESTION POOL DATASTRUCTURE
    // Maps each topic ID to an array of questions containing difficulty levels
    // (easy = 10 pts, medium = 20 pts, hard = 30 pts) and challenge types
    // ------------------------------------------------------------------------
    const questionPool = {
      // --- TOPIC 1: HELLO PYTHON ---
      topic_1: [
        { id: 't1_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Basic Output', questionText: 'Which function prints output in Python?', options: ['print()', 'echo()', 'write()', 'display()'], correctAnswer: 'print()', explanation: 'print() is the built-in output function.' },
        { id: 't1_q2', challengeType: 'Output Prediction', difficulty: 'easy', title: 'String Join', codeSnippet: 'print("Hello" + "Python")', options: ['HelloPython', 'Hello Python', 'Error', 'Hello+Python'], correctAnswer: 'HelloPython', explanation: 'The + operator concatenates strings directly.' },
        { id: 't1_q3', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Fix print syntax', codeSnippet: 'prnt("Hi")', options: ['print("Hi")', 'echo("Hi")', 'printf("Hi")'], correctAnswer: 'print("Hi")', explanation: 'Correct spelling is print.' },
        { id: 't1_q4', challengeType: 'Quiz', difficulty: 'easy', title: 'Strings', questionText: 'How do you wrap text strings in Python?', options: ['Quotes (" ")', 'Parentheses (( ))', 'Brackets ([ ])', 'Braces ({ })'], correctAnswer: 'Quotes (" ")', explanation: 'Strings require single or double quotes.' },
        { id: 't1_q5', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Multiplication', codeSnippet: 'print("A" * 3)', options: ['AAA', 'A3', 'Error', 'AA'], correctAnswer: 'AAA', explanation: 'Multiplying a string repeats it.' },
      ],

      // --- TOPIC 2: VARIABLES ---
      topic_2: [
        { id: 't2_q1', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Variable Addition', codeSnippet: 'x = 10\nx = x + 5\nprint(x)', options: ['15', '10', '5', 'Error'], correctAnswer: '15', explanation: '10 + 5 evaluates to 15.' },
        { id: 't2_q2', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Case Sensitivity', codeSnippet: 'name = "Alex"\nprint(Name)', options: ['print(name)', 'print("Name")', 'print(NAME)'], correctAnswer: 'print(name)', explanation: 'Python is case-sensitive; name != Name.' },
        { id: 't2_q3', challengeType: 'Quiz', difficulty: 'easy', title: 'Naming Rules', questionText: 'Which variable name is invalid?', options: ['2my_var', 'my_var', '_var', 'var2'], correctAnswer: '2my_var', explanation: 'Variables cannot start with numbers.' },
        { id: 't2_q4', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Reassignment', codeSnippet: 'a = 4\na = a * 2\nprint(a)', options: ['8', '4', '6', 'Error'], correctAnswer: '8', explanation: '4 multiplied by 2 is 8.' },
        { id: 't2_q5', challengeType: 'Quiz', difficulty: 'hard', title: 'Data Types', questionText: 'What type is result of 5 / 2 in Python 3?', options: ['float', 'int', 'str', 'bool'], correctAnswer: 'float', explanation: 'Division / always returns a float.' },
      ],

      // --- TOPIC 3: CONDITIONALS ---
      topic_3: [
        { id: 't3_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Conditional Keyword', questionText: 'Which keyword checks alternate conditions?', options: ['elif', 'else if', 'elseif', 'then'], correctAnswer: 'elif', explanation: 'Python uses elif for secondary conditions.' },
        { id: 't3_q2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'If Branch', codeSnippet: 'score = 80\nif score >= 50:\n    print("Pass")\nelse:\n    print("Fail")', options: ['Pass', 'Fail', '80', 'Error'], correctAnswer: 'Pass', explanation: '80 >= 50 is True.' },
        { id: 't3_q3', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Missing Colon', codeSnippet: 'if x > 5\n    print("Yes")', options: ['if x > 5:', 'if (x > 5)', 'if x > 5 then:'], correctAnswer: 'if x > 5:', explanation: 'Compound statements require a trailing colon.' },
        { id: 't3_q4', challengeType: 'Quiz', difficulty: 'medium', title: 'Logical Operators', questionText: 'Which operator means logical AND?', options: ['and', '&&', '&', 'AND'], correctAnswer: 'and', explanation: 'Python uses the word and.' },
        { id: 't3_q5', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Nested If', codeSnippet: 'x = 10\nif x > 5:\n    if x < 15:\n        print("Mid")', options: ['Mid', '10', 'None', 'Error'], correctAnswer: 'Mid', explanation: 'Both conditions evaluate to True.' },
      ],

      // --- TOPIC 4: LOOPS ---
      topic_4: [
        { id: 't4_q1', challengeType: 'Output Prediction', difficulty: 'easy', title: 'Range Loop', codeSnippet: 'for i in range(3):\n    print(i)', options: ['0, 1, 2', '1, 2, 3', '0, 1, 2, 3', '3'], correctAnswer: '0, 1, 2', explanation: 'range(3) stops right before 3.' },
        { id: 't4_q2', challengeType: 'Bug-Fix', difficulty: 'medium', title: 'Infinite Loop', codeSnippet: 'c = 0\nwhile c < 2:\n    print(c)', options: ['c += 1', 'c = 0', 'break'], correctAnswer: 'c += 1', explanation: 'Loop variable must increment to avoid infinite execution.' },
        { id: 't4_q3', challengeType: 'Quiz', difficulty: 'easy', title: 'Loop Break', questionText: 'Keyword to exit a loop immediately?', options: ['break', 'stop', 'exit', 'halt'], correctAnswer: 'break', explanation: 'break exits loops instantly.' },
        { id: 't4_q4', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Step Range', codeSnippet: 'for i in range(1, 6, 2):\n    print(i)', options: ['1, 3, 5', '1, 2, 3', '2, 4, 6', '1, 6'], correctAnswer: '1, 3, 5', explanation: 'Step size 2 skips alternate numbers.' },
        { id: 't4_q5', challengeType: 'Quiz', difficulty: 'medium', title: 'For vs While', questionText: 'When should you use a for loop?', options: ['When iterating over a known sequence', 'Only for infinite loops', 'Never in Python', 'For random execution'], correctAnswer: 'When iterating over a known sequence', explanation: 'For loops iterate over collections/ranges.' },
      ],

      // --- TOPIC 5: FUNCTIONS ---
      topic_5: [
        { id: 't5_q1', challengeType: 'Quiz', difficulty: 'easy', title: 'Function Keyword', questionText: 'Keyword used to define a function?', options: ['def', 'function', 'fn', 'define'], correctAnswer: 'def', explanation: 'def declares a function.' },
        { id: 't5_q2', challengeType: 'Output Prediction', difficulty: 'medium', title: 'Return Value', codeSnippet: 'def add(a, b):\n    return a + b\nprint(add(2, 3))', options: ['5', '23', 'None', 'Error'], correctAnswer: '5', explanation: 'Returns the sum of 2 and 3.' },
        { id: 't5_q3', challengeType: 'Bug-Fix', difficulty: 'hard', title: 'Missing Return', codeSnippet: 'def get_val():\n    x = 10', options: ['return x', 'give x', 'output x'], correctAnswer: 'return x', explanation: 'Functions return None unless specified.' },
        { id: 't5_q4', challengeType: 'Quiz', difficulty: 'medium', title: 'Parameters', questionText: 'Variables defined inside function parentheses are called:', options: ['Parameters / Arguments', 'Globals', 'Constants', 'Classes'], correctAnswer: 'Parameters / Arguments', explanation: 'Passed values are parameters.' },
        { id: 't5_q5', challengeType: 'Output Prediction', difficulty: 'hard', title: 'Scope', codeSnippet: 'x = 5\ndef f():\n    x = 10\nf()\nprint(x)', options: ['5', '10', 'Error', 'None'], correctAnswer: '5', explanation: 'Local variable x does not overwrite global x.' },
      ]
    };

    // ------------------------------------------------------------------------
    // 3. UPLOAD QUESTIONS TO FIRESTORE SUB-COLLECTIONS
    // Outer loop iterates through [topicId, questions] pairs in questionPool.
    // Fixed syntax: Uses "const [topicId, questions]" variable declaration.
    // ------------------------------------------------------------------------
    for (const [topicId, questions] of Object.entries(questionPool)) {
      // Inner loop iterates through each question object within the current topic
      for (const q of questions) {
        // Uploads each question into its parent topic's 'questions' sub-collection:
        // Path: topics/{topicId}/questions/{questionId}
        await setDoc(doc(db, 'topics', topicId, 'questions', q.id), q);
      }
    }

    console.log("🎉 Expanded database successfully seeded!");
  } catch (error) {
    // Catch and log any network or Firestore permission errors
    console.error("Error seeding expanded database:", error);
  }
}