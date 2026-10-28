
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You are authenticated!",
    userId: req.user.userId
  });
});

module.exports = router;
