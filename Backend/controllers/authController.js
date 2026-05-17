// Import User model
const User = require("../models/User");

// Import bcrypt
const bcrypt = require("bcrypt");

const jwt=require("jsonwebtoken");

// Register Controller
exports.registerUser = async (req, res) => {
    try {

        // Extract data from request body
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Send response
        res.status(201).json({
            message: "User registered successfully",
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate fields
        if (!email || !password) {
            return res.status(400).json({ message: "Both fields are required" });
        }

        // 2. Find user (Using capital 'User')
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        // 4. Check if match failed (Using 'isMatch')
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 5. Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 6. Return token to the client
        res.status(200).json({
            message: "Login Successful",
            token: token,
            user: { name: user.name, email: user.email }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};