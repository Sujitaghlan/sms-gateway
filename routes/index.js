
const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const walletRoutes = require("./walletRoutes");
const testRoutes = require("./testRoutes");
const smsRoutes = require("./smsRoutes");
const smsLogRoutes = require("./smsLogRoutes");
const providerRoutes = require("./providerRoutes");

router.use("/auth", authRoutes);
router.use("/test", testRoutes);
router.use("/wallet", walletRoutes);
router.use("/sms", smsRoutes);
router.use("/sms/logs", smsLogRoutes);
router.use("/routes", providerRoutes);

module.exports = router;
