import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../be/examredi-backend/.env') });

const paperSchema = new mongoose.Schema({
    subject: String,
    year: Number,
    exam: String
});

const Paper = mongoose.model('Paper', paperSchema);

async function analyze() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/examredi');
        console.log('Connected to MongoDB');

        const years = await Paper.distinct('year');
        const results = [];

        for (const year of years) {
            const subjects = await Paper.distinct('subject', { year });
            results.push({ year, count: subjects.length, subjects });
        }

        results.sort((a, b) => b.count - a.count);
        
        console.log('TOP 5 YEARS BY SUBJECT COVERAGE:');
        results.slice(0, 5).forEach(r => {
            console.log(`Year ${r.year}: ${r.count} subjects`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

analyze();
