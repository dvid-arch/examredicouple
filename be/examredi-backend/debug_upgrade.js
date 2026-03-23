import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const debugUpgrade = async () => {
    const localUri = 'mongodb://localhost:27017/examredi';
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(localUri);
        console.log('Connected.');

        // Find a random user who is 'free'
        const user = await User.findOne({ subscription: 'free' });
        if (!user) {
            console.log('No user with "free" subscription found.');
            process.exit(0);
        }

        console.log(`Found user: ${user.name} (${user.email || 'no email'})`);
        console.log(`Current subscription: ${user.subscription}`);

        // Try to update to 'pro'
        user.subscription = 'pro';
        console.log('Attempting to save...');

        try {
            await user.save();
            console.log('SUCCESS: User updated to "pro"');

            // Revert for safety
            user.subscription = 'free';
            await user.save();
            console.log('SUCCESS: User reverted to "free"');
        } catch (saveError) {
            console.error('CRITICAL SAVE ERROR:');
            console.error(JSON.stringify(saveError, null, 2));
            if (saveError.errors) {
                Object.keys(saveError.errors).forEach(key => {
                    console.log(`- Validation Error in [${key}]: ${saveError.errors[key].message}`);
                });
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Fatal Error:', error.message);
        process.exit(1);
    }
};

debugUpgrade();
