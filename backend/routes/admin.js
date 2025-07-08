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

    // Filter out disabled users
    const activeUsers = listUsersResult.users
      .filter((userRecord) => !userRecord.disabled)
      .map((userRecord) => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || "",
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        role: userRecord.customClaims?.role || "user",
      }));

    res.status(200).json(activeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

const addUserByAdmin = async (email, password, displayName, role) => {
  // First create the basic user account
  const user = await admin.auth().createUser({
    email,
    password,
    displayName,
  });

  // Then set the custom claims (including role)
  await admin.auth().setCustomUserClaims(user.uid, {
    role: role,
    admin: true,
  });

  return user;
};

router.post("/add-admin", async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    // Create user with admin role
    const user = await addUserByAdmin(email, password, displayName, "admin");

    res.status(200).json({
      message: "Admin added successfully",
      uid: user.uid,
      email: user.email,
      role: "admin",
    });
  } catch (err) {
    console.error("Error adding admin:", err);
    res.status(500).json({
      error: "Failed to add admin user",
      details: err.message,
    });
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

router.patch("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    console.log("Disabling user:", userId);

    // Disable the user in Firebase Authentication only
    await admin.auth().updateUser(userId, { disabled: true });

    res.status(200).json({ message: "User disabled successfully" });
  } catch (error) {
    console.error("Error disabling user:", error);
    res
      .status(500)
      .json({ message: "Error disabling user", error: error.message });
  }
});

// GET /disabled-users
router.get("/disabled-users", async (req, res) => {
  const disabledUsers = [];

  try {
    let nextPageToken;
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);

      for (const userRecord of listUsersResult.users) {
        if (userRecord.disabled) {
          const customClaims = userRecord.customClaims || {};
          disabledUsers.push({
            uid: userRecord.uid,
            role: customClaims.role || "user",
            email: userRecord.email || "",
            displayName: userRecord.displayName || "",
            disabled: userRecord.disabled,
          });
        }
      }

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    res.status(200).json(disabledUsers);
  } catch (error) {
    console.error("Error fetching disabled users:", error);
    res.status(500).json({ message: "Failed to fetch disabled user" });
  }
});

// PUT /enable-user
router.put("/enable-user", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { disabled: false });
    res.status(200).json({ message: "User enabled successfully" });
  } catch (error) {
    console.error("Error enabling user:", error);
    res.status(500).json({ message: "Failed to enable user" });
  }
});

module.exports = router;
