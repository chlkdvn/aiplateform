import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // ADD THIS
import dns from "node:dns";

import session from "express-session";
import passport from "./config/passport.js";

import { connectDB } from "./database/database.js";
import authRoutes from "./routers/auth.js";
import onboardingRoutes from "./routers/onboarding.js";
import AdminRouter from "./routers/adminRoutes.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const app = express();

/* ---------------- CORS ---------------- */
const corsOptions = {
  origin: "http://localhost:5500",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
};

app.use(cors(corsOptions));

/* ---------------- BODY PARSERS ---------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- COOKIE PARSER ---------------- */
// REQUIRED for req.cookies to work!
app.use(cookieParser());

/* ---------------- SESSION ---------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      httpOnly: true,
      secure: false, // dev only (HTTPS = true in production)
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

/* ---------------- PASSPORT ---------------- */
app.use(passport.initialize());
app.use(passport.session());

/* ---------------- ROUTES ---------------- */
app.use("/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use('/api/admin', AdminRouter);

/* ---------------- TEST ---------------- */
app.get("/", (req, res) => {
  res.send("Server running on port 4000 🚀");
});

/* ---------------- DB ---------------- */
connectDB();

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});