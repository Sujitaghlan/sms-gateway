
const express = require("express");
const router = express.Router();

const { sendSms } = require("../controllers/smsController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/send", authMiddleware, sendSms);

module.exports = router;
