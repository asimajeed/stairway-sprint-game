import express from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import leaderboardRouter from "./routes/leaderboard";

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI as string, { ssl: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use("/leaderboard", leaderboardRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
