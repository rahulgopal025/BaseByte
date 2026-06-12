import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const { default: Problem } = await import('../models/Problem.js');
const problemsData = JSON.parse(readFileSync(join(__dirname, '../data/seedProblems.json'), 'utf-8'));

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await Problem.deleteMany({});
    await Problem.insertMany(problemsData);
    console.log(`✅ Seeded ${problemsData.length} problems successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDB();
