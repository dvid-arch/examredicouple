import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    handlePaymentWebhook,
    generateAccessToken,
    generateRefreshToken,
    createSession
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';
import passport from 'passport';

const router = express.Router();

// Google OAuth Routes
router.get('/google', (req, res, next) => {
    const { ref } = req.query;
    const state = ref ? `ref_${ref}` : undefined;
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        state: state
    })(req, res, next);
});
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        let frontendUrl = process.env.FRONTEND_URL || 'https://examredi.com';
        if (frontendUrl.endsWith('/')) frontendUrl = frontendUrl.slice(0, -1);

        if (err) {
            console.error('[OAuth Callback Error]:', err);
            return res.redirect(`${frontendUrl}/login?error=auth_failed&msg=${encodeURIComponent(err.message)}`);
        }

        if (!user) {
            console.warn('[OAuth Callback Info]:', info);
            return res.redirect(`${frontendUrl}/login?error=user_not_found`);
        }

        try {
            const sessionId = await createSession(user, req);
            const accessToken = generateAccessToken(user.id, sessionId);
            const refreshToken = generateRefreshToken(user.id, sessionId);

            return res.redirect(`${frontendUrl}/auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        } catch (error) {
            console.error('[Session Creation Error]:', error);
            return res.redirect(`${frontendUrl}/login?error=session_error`);
        }
    })(req, res, next);
});


router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.put('/verifyemail/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerification);
router.post('/webhook', handlePaymentWebhook);

router.get('/fix-db-index', async (req, res) => {
    try {
        const collection = req.app.locals.db ? req.app.locals.db.collection('users') : (await import('mongoose')).connection.collection('users');
        if (!collection) return res.status(500).json({ msg: 'No DB connection' });

        try {
            await collection.dropIndex('username_1');
            res.json({ msg: 'Index username_1 dropped successfully' });
        } catch (e) {
            res.json({ msg: 'Index might not exist or verify error', error: e.message });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;