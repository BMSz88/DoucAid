require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo"); // Store sessions in MongoDB
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const EmployeeModel = require("./models/Employee");
const jwt = require("jsonwebtoken"); // Import JWT
const SECRET_KEY = process.env.JWT_SECRET || "default_secret"; // Fallback secret

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ✅ Session Configuration (Stored in MongoDB for better scalability)
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret", // Fallback secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // Ensure this is set in .env
        collectionName: 'sessions',
        crypto: { secret: process.env.SESSION_SECRET } // Encrypt session data
    }),
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// ✅ Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("🔹 Google Profile:", profile);

        let user = await EmployeeModel.findOne({ email: profile.emails[0].value });

        if (!user) {
            // Create user if doesn't exist
            user = await EmployeeModel.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: null // Password is not needed for Google login
            });
        }
        return done(null, user);
    } catch (err) {
        console.error("❌ Google authentication error:", err);
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await EmployeeModel.findById(id);
        if (!user) return done(null, false); // Handle deleted user
        done(null, user);
    } catch (err) {
        console.error("❌ Error in deserializeUser:", err);
        done(err, null);
    }
});

// ✅ Google Authentication Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect("http://localhost:5173/home");
    }
);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ User Registration Route
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await EmployeeModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await EmployeeModel.create({ name, email, password: hashedPassword });
        res.json({ message: "✅ Registration successful" });
    } catch (err) {
        console.error("❌ Registration error:", err);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// ✅ User Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await EmployeeModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "No record existed" });
        }
        if (!user.password) {
            return res.status(401).json({ message: "Use Google login instead" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // 🔹 Set session for passport authentication
        req.login(user, err => {
            if (err) {
                console.error("❌ Session error:", err);
                return res.status(500).json({ message: "Session creation error" });
            }

            // 🔹 Generate a JWT token
            const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

            // 🔹 Store JWT in session (not recommended to store tokens in session)
            req.session.token = token;

            // 🔹 Return JWT token in response and redirect message
            res.json({
                message: "✅ Login successful",
                redirect: "http://localhost:5173/home", // Frontend will handle the redirection
                user: { id: user._id, email: user.email },
                token
            });
        });

    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}...`);
});
