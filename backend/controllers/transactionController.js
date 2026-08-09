const Transaction = require("../models/Transaction");

// Add Transaction (owned by the logged-in user)
const addTransaction = async (req, res) => {
    try {
        const { title, amount, type, category, date } = req.body;

        await Transaction.create({
            title,
            amount,
            type,
            category,
            date,
            user: req.userId,
        });

        res.json({
            message: "Transaction Added Successfully"
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get All Transactions (only the logged-in user's own transactions)
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.userId }).sort({ _id: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete Transaction (only if it belongs to the logged-in user)
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await Transaction.findOneAndDelete({
            _id: id,
            user: req.userId,
        });

        if (!result) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({
            message: "Transaction Deleted Successfully"
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Update Transaction (only if it belongs to the logged-in user)
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, type, category, date } = req.body;

        const result = await Transaction.findOneAndUpdate(
            { _id: id, user: req.userId },
            { title, amount, type, category, date },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({ message: "Updated Successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction
};
