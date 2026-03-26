
import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    estimatedScore: { type: Number, default: 0 },
    subject: { type: String, default: 'UTME Challenge' },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard;
