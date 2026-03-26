import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const configurePassport = (passport) => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET,
                callbackURL: process.env.BACKEND_URL
                    ? (process.env.BACKEND_URL.endsWith('/') ? `${process.env.BACKEND_URL}api/auth/google/callback` : `${process.env.BACKEND_URL}/api/auth/google/callback`)
                    : '/api/auth/google/callback',
                proxy: true,
                passReqToCallback: true // Crucial for referral tracking
            },


            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const photoURL = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

                    let user = await User.findOne({ email });

                    if (user) {
                        // Link Google ID if match found by email
                        let modified = false;
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            modified = true;
                        }
                        // Update photoURL if available and not set
                        if (photoURL && !user.photoURL) {
                            user.photoURL = photoURL;
                            modified = true;
                        }
                        if (modified) await user.save();
                        return done(null, user);
                    }

                    // Handle Referral for new user
                    let referredBy = null;
                    let referrerDoc = null;

                    // Capture referral code from state (passed from frontend -> backend /google route)
                    const incomingReferralCode = req.query.state;
                    if (incomingReferralCode && incomingReferralCode.startsWith('ref_')) {
                        const code = incomingReferralCode.replace('ref_', '');
                        referrerDoc = await User.findOne({ referralCode: code });
                        if (referrerDoc) {
                            referredBy = referrerDoc._id;
                        }
                    }

                    const newReferralCode = `EXAM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

                    // Create new user if not found
                    user = await User.create({
                        name: profile.displayName || email.split('@')[0],
                        email: email,
                        googleId: profile.id,
                        photoURL: photoURL,
                        isVerified: true, // Google accounts are pre-verified
                        subscription: 'free',
                        referralCode: newReferralCode,
                        referredBy,
                        role: 'user',
                        studyPlan: {
                            targetScore: 250,
                            weakSubjects: [],
                            dailyGoal: 10
                        }
                    });

                    // Add to referrer's pending list
                    if (user && referrerDoc) {
                        referrerDoc.referredUsers.push({
                            userId: user._id,
                            name: user.name,
                            email: user.email,
                            status: 'pending',
                            reward: 400
                        });
                        referrerDoc.referralPending += 400;
                        await referrerDoc.save();
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

export default configurePassport;
