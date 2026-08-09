const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction
} = require("../controllers/transactionController");

// All transaction routes require a valid login token,
// and every controller uses req.userId to scope data per-user.
router.use(verifyToken);

router.put("/:id", updateTransaction);

router.post("/add", addTransaction);
router.get("/", getTransactions);
router.delete("/:id", deleteTransaction);

module.exports = router;
