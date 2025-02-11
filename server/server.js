require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const EmployeeModel = require("./models/Employee");

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.JWT_SECRET || "default_secret";

// ✅ Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ✅ MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Session Configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET || "default_secret",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
            crypto: { secret: process.env.SESSION_SECRET },
        }),
        cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    })
);

// ✅ Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3001/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await EmployeeModel.findOne({ email: profile.emails[0].value });
                if (!user) {
                    user = await EmployeeModel.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: null, // Google OAuth users do not have passwords
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await EmployeeModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// ✅ Google OAuth Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("http://localhost:5173/home");
    }
);

// ✅ User Registration Route
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await EmployeeModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await EmployeeModel.create({ name, email, password: hashedPassword });

        res.json({ message: "✅ Registration successful", user: newUser });
    } catch (err) {
        console.error("❌ Registration error:", err);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// ✅ User Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await EmployeeModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "No record existed" });
        if (!user.password) return res.status(401).json({ message: "Use Google login instead" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Incorrect password" });

        // 🔹 Generate a JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ message: "✅ Login successful", token });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}...`);
});
