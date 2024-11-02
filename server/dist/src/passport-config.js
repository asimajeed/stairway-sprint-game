"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_local_1 = require("passport-local");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./db");
const configurePassport = (passport) => {
    // Local Strategy
    passport.use(new passport_local_1.Strategy(async (username, password, done) => {
        const res = await (0, db_1.query)("SELECT * FROM users WHERE username = $1", [username]);
        const user = res.rows[0];
        if (!user) {
            return done(null, false, { message: "No user with that username" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (isMatch) {
            return done(null, user);
        }
        else {
            return done(null, false, { message: "Password incorrect" });
        }
    }));
    // Google OAuth Strategy
    passport.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.CLIENT_ID || "",
        clientSecret: process.env.CLIENT_SECRET || "",
        callbackURL: "/auth/google/callback",
    }, async (accessToken, refreshToken, profile, done) => {
        const res = await (0, db_1.query)("SELECT * FROM users WHERE oauth_provider_id = $1", [
            profile.id,
        ]);
        let user = res.rows[0];
        if (!user) {
            const newUser = await (0, db_1.query)("INSERT INTO users (username, oauth_provider, oauth_provider_id, profile_photo_url) VALUES ($1, $2, $3, $4) RETURNING *", [
                profile.displayName,
                profile.provider,
                profile.id,
                profile?.photos?.[0].value || "",
            ]);
            user = newUser.rows[0];
        }
        done(null, user);
    }));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        const res = await (0, db_1.query)("SELECT * FROM users WHERE id = $1", [id]);
        done(null, res.rows[0]);
    });
};
exports.configurePassport = configurePassport;
