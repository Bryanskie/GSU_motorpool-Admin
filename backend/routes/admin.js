const express = require("express");
const { auth, db } = require("../firebase-admin");
const { verifyToken, checkAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/auth-users", async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers(1000);
    console.log("List of users fetched:", listUsersResult.users.length);

    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || "",
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching auth users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Promote to Admin
router.post("/promote", verifyToken, checkAdmin, async (req, res) => {
  const { uid } = req.body;
  await db.collection("users").doc(uid).update({ role: "admin" });
  res.send("User promoted to admin.");
});

router.put("/user/:uid", verifyToken, checkAdmin, async (req, res) => {
  const { uid } = req.params;
  const { email, displayName } = req.body;

  try {
    // Update user in Firebase Authentication
    const updatedUser = await auth.updateUser(uid, {
      email,
      displayName,
    });

    // Update user in Firestore
    await db.collection("users").doc(uid).update({
      email,
      displayName,
    });

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(400).send("Error updating user");
  }
});

// Delete user
router.delete("/user/:uid", verifyToken, checkAdmin, async (req, res) => {
  const { uid } = req.params;

  try {
    // Delete the user from Firebase Authentication
    await auth.deleteUser(uid);

    // Delete the user document from Firestore
    await db.collection("users").doc(uid).delete();

    res.send("User deleted.");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(400).send("Error deleting user");
  }
});

module.exports = router;
