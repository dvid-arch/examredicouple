import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Paper from './src/models/Paper.js';

dotenv.config();

async function runTests() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const testCases = [
        "utme-acco-1994-q1",      // Exact match
        "UTME-ACCO-1994-Q1",      // Uppercase match
        "utme-acco-1994-q1000",   // Non-existent
    ];

    for (const testId of testCases) {
        console.log(`\n--- Testing ID: ${testId} ---`);
        const idRegex = new RegExp('^' + testId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
        const paper = await Paper.findOne({ 'questions.id': idRegex }).lean();

        if (paper) {
            console.log(`Found Paper: ${paper.subject} ${paper.year}`);
            const question = paper.questions.find(q => q.id.toLowerCase() === testId.toLowerCase());
            if (question) {
                console.log(`Found Question: ${question.question.substring(0, 50)}...`);
            } else {
                console.log("FAILED: Paper found but question not found inside array.");
            }
        } else {
            console.log("Paper not found.");
        }
    }

    mongoose.connection.close();
}

runTests();
