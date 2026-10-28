
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getSmsLogs } = require("../controllers/smsControllerLog");

router.get("/", authMiddleware, getSmsLogs);

module.exports = router;
