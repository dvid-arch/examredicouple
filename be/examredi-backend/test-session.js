import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

const dbPath = process.env.MONGODB_URI;

async function check() {
  await mongoose.connect(dbPath);
  console.log("Connected to MongoDB!");

  const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    activeSessions: [{
        sessionId: { type: String, required: true },
        device: { type: String },
        ip: { type: String },
        lastActive: { type: Date, default: Date.now }
    }],
    referralCode: String,
    password: { type: String, required: false }
  }, { strict: false }));

  let email = "testybob@example.com";
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email });
    await user.save();
    console.log("Created test user");
  }

  const req = { headers: { 'user-agent': 'node' }, ip: '127.0.0.1' };
  
  // create session exact logic
  const sessionId = uuidv4();
  user.activeSessions = user.activeSessions || [];
  user.activeSessions.push({
      sessionId,
      device: req.headers['user-agent'],
      ip: req.ip,
      lastActive: new Date()
  });

  if (user.activeSessions.length > 2) {
      user.activeSessions.shift();
  }

  await user.save();
  console.log("Saved with session:", sessionId);

  // refetch
  let userAgain = await User.findOne({ email });
  console.log("Refetched active sessions length:", userAgain.activeSessions.length);
  
  let valid = userAgain.activeSessions.some(s => s.sessionId === sessionId);
  console.log("Session verified?:", valid);

  process.exit(0);
}
check().catch(console.error);
