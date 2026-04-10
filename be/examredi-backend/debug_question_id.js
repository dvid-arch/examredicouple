import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Paper from './src/models/Paper.js';

dotenv.config();

async function debugQuestionById() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find any paper with questions
        const paper = await Paper.findOne({ 'questions.0': { $exists: true } }).lean();
        if (!paper) {
            console.log('No papers found with questions');
            process.exit(0);
        }

        const questionId = paper.questions[0].id;
        console.log(`Checking for Question ID: ${questionId}`);

        const foundPaper = await Paper.findOne({ 'questions.id': questionId }).lean();
        if (!foundPaper) {
            console.log('FAILED to find paper by questions.id');
        } else {
            console.log('SUCCESS: Found paper by questions.id');
            const question = foundPaper.questions.find(q => q.id === questionId);
            if (question) {
                console.log('SUCCESS: Found question in paper');
            } else {
                console.log('FAILED: Question not found in paper despite Paper found');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugQuestionById();
