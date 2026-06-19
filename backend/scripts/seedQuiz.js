import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const { default: Quiz } = await import('../models/Quiz.js');

const cData = JSON.parse(readFileSync(join(__dirname, '../data/cQuizzes.json'), 'utf-8'));
const pythonData = JSON.parse(readFileSync(join(__dirname, '../data/pythonQuizzes.json'), 'utf-8'));
const javaData = JSON.parse(readFileSync(join(__dirname, '../data/javaQuizzes.json'), 'utf-8'));

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await Quiz.deleteMany({});
    const allQuizzes = [...cData, ...pythonData, ...javaData];
    await Quiz.insertMany(allQuizzes);
    console.log(`✅ Seeded ${allQuizzes.length} quiz questions successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedData();

