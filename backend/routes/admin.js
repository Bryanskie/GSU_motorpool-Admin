const express = require("express");
const admin = require("firebase-admin"); // Import Firebase Admin SDK
const { auth, db } = require("../firebase-admin");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Or use a path to your service account file
  });
}

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
router.post("/promote", verifyToken, async (req, res) => {
  const { uid } = req.body;
  await db.collection("users").doc(uid).update({ role: "admin" });
  res.send("User promoted to admin.");
});

// router.put("/user/:uid", verifyToken, async (req, res) => {
//   const { uid } = req.params;
//   const { email, displayName } = req.body;

//   try {
//     // Update user in Firebase Authentication
//     const updatedUser = await auth.updateUser(uid, {
//       email,
//       displayName,
//     });

//     // Update user in Firestore
//     await db.collection("users").doc(uid).update({
//       email,
//       displayName,
//     });

//     res.json({
//       message: "User updated successfully",
//       user: updatedUser,
//     });
//   } catch (err) {
//     console.error("Error updating user:", err);
//     res.status(400).send("Error updating user");
//   }
// });

// Update a user's auth profile
router.put("/user/:uid", async (req, res) => {
  const { uid } = req.params;
  const { displayName, email } = req.body;

  try {
    const updatedUser = await admin.auth().updateUser(uid, {
      displayName,
      email,
    });

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
});

module.exports = router;

// Delete user
router.delete("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    console.log("Deleting user with ID:", userId); // Check if ID is correctly passed

    // Attempt to delete the user using Firebase Admin SDK
    await admin.auth().deleteUser(userId); // Now 'admin' is defined and working correctly

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error); // Log the error for debugging
    res.status(500).json({ message: "Error deleting user" });
  }
});

module.exports = router;
