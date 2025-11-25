const express = require("express");
const router = express.Router();
const tkbController = require("../controllers/ThoiKhoaBieuController");
const { authenticateToken } = require("../middlewares/auth");

router.post("/", authenticateToken, tkbController.createTKB);
router.get("/", authenticateToken, tkbController.getTKB);
router.delete("/:maTKB", authenticateToken, tkbController.deleteTKB);

module.exports = router;