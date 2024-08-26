import mongoose from "mongoose";

export interface ILeaderboard extends mongoose.Document {
  name: String;
  score: number;
  date: Date;
}

const leaderboardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { collection: "Leaderboard" }
);

export default mongoose.model<ILeaderboard>("Leaderboard", leaderboardSchema);
