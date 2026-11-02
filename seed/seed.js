const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const questionsData = require('./questions.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDatabase() {
  console.log('Seeding topics and questions...');
  
  // 1. Seed the 5 core Python topics
  const topics = [
    { id: 'topic_1', title: 'Hello Python', order: 1 },
    { id: 'topic_2', title: 'Variables', order: 2 },
    { id: 'topic_3', title: 'Conditionals', order: 3 },
    { id: 'topic_4', title: 'Loops', order: 4 },
    { id: 'topic_5', title: 'Functions', order: 5 }
  ];

  for (const topic of topics) {
    await db.collection('topics').doc(topic.id).set(topic);
  }

  // 2. Seed question bank items
  for (const q of questionsData) {
    await db.collection('questions').add(q);
  }

  console.log('Database seeded successfully!');
}

seedDatabase().catch(console.error);