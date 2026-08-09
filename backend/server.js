const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Smart Expense Tracker API is Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
