const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getProviderHealth } = require("../controllers/providerController");

router.get("/health", authMiddleware, getProviderHealth);

module.exports = router;