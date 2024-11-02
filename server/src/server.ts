import express from "express";
import session from "express-session";
import passport from "passport";
import * as dotenv from "dotenv";
import { query } from "./db";
import { configurePassport } from "./passport-config";
import bcrypt from "bcryptjs";
import cors from "cors";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());

configurePassport(passport);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json(req.user);
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.CLIENT_URL }),
  (req, res) => {
    res.send(`
      <script>
        window.opener.postMessage({ status: 'success' }, '${process.env.CLIENT_URL}');
        window.close();
      </script>
    `);
  }
);

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
    const user = {username, profile_photo_url}
    res.json(user); 
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
