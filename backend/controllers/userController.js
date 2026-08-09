const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Same idea as the frontend meter, kept simple and dependency-free
// so a weak password can never reach the database even if someone
// calls this API directly (bypassing the React form).
const COMMON_WEAK_PASSWORDS = [
    "123456", "12345678", "123456789", "1234567890",
    "password", "password1", "qwerty", "qwerty123",
    "111111", "000000", "abc123", "letmein", "iloveyou", "admin123",
];

const isStrongPassword = (password) => {
    if (typeof password !== "string" || password.length < 8) return false;
    if (COMMON_WEAK_PASSWORDS.includes(password.toLowerCase())) return false;
    if (/^(.)\1+$/.test(password)) return false; // e.g. "aaaaaaaa"
    if (/^(0123456789|1234567890)/i.test(password)) return false;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    // Require at least 3 of the 4 character classes (mirrors the
    // "medium" strength threshold shown on the frontend).
    const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    return score >= 3;
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                message:
                    "Password is too weak. Use at least 8 characters with a mix of uppercase, lowercase, numbers or symbols.",
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await User.create({ name, email, password: hashPassword });

        res.json({
            message: "User Registered Successfully"
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: "User Not Found" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.json({ message: "Wrong Password" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "mysecretkey",
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login Successful",
            token,
            name: user.name
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
  register,
  login
};
