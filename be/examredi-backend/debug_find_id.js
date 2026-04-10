import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Paper from './src/models/Paper.js';

dotenv.config();

async function printOneId() {
    await mongoose.connect(process.env.MONGO_URI);
    const paper = await Paper.findOne({ 'questions.0': { $exists: true } }).lean();
    if (paper) {
        console.log(`Found paper: ${paper.subject} ${paper.year}`);
        console.log(`First question ID: ${paper.questions[0].id}`);
    } else {
        console.log('No papers found.');
    }
    mongoose.connection.close();
}

printOneId();
