import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { query } from "./db";
import { PassportStatic } from "passport";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password_hash: string;
      oauth_provider: string;
      oauth_provider_id: string;
      profile_photo_url: string;
      created_at: string;
      updated_at: string;
    }
  }
}

export const configurePassport = (passport: PassportStatic) => {
  // Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const res = await query("SELECT * FROM users WHERE username = $1", [username]);
      const user = res.rows[0];
      if (!user) {
        return done(null, false, { message: "No user with that username" });
      }
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    })
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID || "",
        clientSecret: process.env.CLIENT_SECRET || "",
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const res = await query("SELECT * FROM users WHERE oauth_provider_id = $1", [
          profile.id,
        ]);
        let user = res.rows[0];
        if (!user) {
          const newUser = await query(
            "INSERT INTO users (username, oauth_provider, oauth_provider_id, profile_photo_url) VALUES ($1, $2, $3, $4) RETURNING *",
            [
              profile.displayName,
              profile.provider,
              profile.id,
              profile?.photos?.[0].value || "",
            ]
          );
          user = newUser.rows[0];
        }
        done(null, user);
      }
    )
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const res = await query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, res.rows[0]);
  });
};
