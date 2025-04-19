const router = require("express").Router();
const User = require("../models/User");

const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const {
  accessKeyId,
  secretAccessKey,
  region,
  emailAddress,
} = require("../config");
const bcrypt = require("bcryptjs");
const transporter = require("../utils/emailConfig");

// Bring in the User Registration function
const {
  serializeUser,
  checkRole,
  userRegister,
  userLogin,
  userAuth,
} = require("../utils/Auth");

/****************************************************************************************************
UPDATE USER => START
****************************************************************************************************/
router.put("/profile", userAuth, async (req, res) => {
  const userId = req.user._id;
  const updates = req.body;

  try {
    // Validate updates here if needed

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).send({ error: "User not found" });
    }

    const mainFacet = await Facet.findOne({ name: "main" });
    const user = await Channel.findOne({
      facet: mainFacet._id,
      user: req.user,
    }).populate({
      path: "user",
      model: "users",
      select:
        "_id userName name avatar biography email gender role phoneNumber followings birthday dob location isActive isVerified ",
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      data: user,
      success: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});
/****************************************************************************************************
UPDATE USER => ENDS
****************************************************************************************************/
/****************************************************************************************************
QUERY USERS => START
****************************************************************************************************/
router.get("/search", userAuth, async (req, res) => {
  const query = req.query.q; // Get the search query parameter from the URL
  console.log("search users query", query);

  try {
    // Perform a case-insensitive search for users whose name or email matches the query
    const users = await User.find({
      role: "user", // Add this condition to filter by role
      $or: [
        { userName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    });
    console.log("search users", users);
    var result = users.map((eachUser) => serializeUser(eachUser));
    res.json({ message: "Users found", data: result, success: true });
  } catch (err) {
    res.status(500).json({ message: err.message, data: "", success: false });
  }
});
/****************************************************************************************************
QUERY USERS => ENDS
****************************************************************************************************/
module.exports = router;
