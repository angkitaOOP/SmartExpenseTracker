const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ["Income", "Expense"],
            required: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
        },
        // Every transaction belongs to exactly one user — this is what
        // keeps one account's data from leaking into another account.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: false },
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                // Keep the frontend happy: it reads item.id (not item._id)
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);
