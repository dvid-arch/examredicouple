import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const PaperSchema = new mongoose.Schema({
  subject: String,
  questions: [{
    question: String,
    topics: [String]
  }]
}, { strict: false });

const Paper = mongoose.models.Paper || mongoose.model("Paper", PaperSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB!");
  const mathPapers = await Paper.find({ subject: /Math/i }).lean();
  let algebraCount = 0;
  let allTopics = new Set();
  
  for(const p of mathPapers) {
    if(p.questions) {
      for(const q of p.questions) {
        if(q.topics) {
          q.topics.forEach(t => allTopics.add(t));
          if(q.topics.some(t => t.toLowerCase() === 'algebra')) {
            algebraCount++;
          }
        }
      }
    }
  }
  
  console.log("Algebra matches:", algebraCount);
  console.log("All Math Topics:", Array.from(allTopics).join(", "));
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
