const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const cors = require('cors');
const app = express();

// 1. Setup - This lets your GitHub website talk to this server
app.use(cors());
app.use(express.json());

// 2. Connect to MongoDB using the secret link you put in Render
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connected to MongoDB!"))
    .catch(err => console.error("❌ Database connection error:", err));

// 3. Create the "User" model (how the data looks in the database)
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    passwordHash: String,
    createdAt: { type: Date, default: Date.now }
}));

// 4. The Route - This is the "address" your website sends logins to
app.post('/save-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Hash the password (SHA-256)
        const hash = crypto.createHash('sha256').update(password).digest('hex');

        // Save it to the cloud
        const newUser = new User({ username, passwordHash: hash });
        await newUser.save();

        res.json({ message: "Saved to your permanent database!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Keep the server alive 24/7
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server is live and listening on port ${PORT}`);
});
