// middlewares/auth.js
const { auth, db } = require('../firebase-admin');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Access Denied");

  console.log("Received Token:", token); // For debugging

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(400).send("Invalid Token");
  }
};

const checkAdmin = async (req, res, next) => {
  const userDoc = await db.collection('users').doc(req.user.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    return res.status(403).send("Access Denied: Admins only");
  }
  next();
};

module.exports = { verifyToken, checkAdmin };
