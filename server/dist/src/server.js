"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const dotenv = __importStar(require("dotenv"));
const db_1 = require("./db");
const passport_config_1 = require("./passport-config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cors_1 = __importDefault(require("cors"));
dotenv.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, passport_config_1.configurePassport)(passport_1.default);
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    try {
        const newUser = await (0, db_1.query)("INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *", [username, hashedPassword]);
        res.status(201).json(newUser.rows[0]);
    }
    catch (err) {
        res.status(400).json({ error: "User already exists" });
    }
});
app.post("/login", passport_1.default.authenticate("local"), (req, res) => {
    res.json(req.user);
});
app.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile"] }));
app.get("/auth/google/callback", passport_1.default.authenticate("google", { failureRedirect: process.env.CLIENT_URL }), (req, res) => {
    res.send(`
      <script>
        window.opener.postMessage({ status: 'success' }, '${process.env.CLIENT_URL}');
        window.close();
      </script>
    `);
});
app.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send({ error: "Logout failed" });
        }
        res.send({ success: "Logout successful" });
    });
});
app.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        const { username, profile_photo_url } = req.user;
        const user = { username, profile_photo_url };
        res.json(user);
    }
    else {
        res.status(401).json({ error: "Unauthorized" });
    }
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
