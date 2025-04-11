const express = require('express');
const { sendEmail } = require('../utils/nodemailer');
const { admin, db } = require('../firebase-admin');
const { verifyToken } = require('../middleware/auth'); // 👈 Import it here


const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName });
    console.log('User created:', userRecord); // Log the user record to confirm creation

    // Save user to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role: 'user',
    });
    console.log('User saved to Firestore');

    // Send welcome email
    await sendEmail(email, 'Welcome!', `Welcome to our app, ${displayName}!`, `<h1>Welcome, ${displayName}!</h1>`);

    res.send('Signup successful');
  } catch (err) {
    console.error('Error during signup:', err.message);
    res.status(400).send(err.message);
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Sign in user using Firebase Authentication
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Simulate password check (Firebase doesn't allow direct password verification)
    // You can use Firebase Authentication client SDK to check the password on the frontend
    // or implement custom authentication logic. This example assumes successful login.
    
    // You can issue a custom token or use Firebase ID token for session management.
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.json({
      message: 'Login successful',
      token: customToken // Return the custom token or ID token
    });
  } catch (err) {
    res.status(400).send('Invalid email or password');
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    await sendEmail(email, 'Reset your password', 'Click the link to reset your password', `<a href="${link}">Reset Password</a>`);
    res.send('Password reset email sent.');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post('/logout', (req, res) => {
  // In a token-based system (like JWT), you just need to delete the token from the client-side
  // The client can remove the token from localStorage or cookies, and it will automatically "log out"

  // Example: If using a session or JWT token in cookies:
  res.clearCookie('token');  // Clear the cookie where token is stored

  res.send('Logout successful');
});

module.exports = router;
