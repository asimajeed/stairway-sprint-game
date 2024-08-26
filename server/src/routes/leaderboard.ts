import { Router, Request } from "express";
import Leaderboard, { ILeaderboard } from "../models/leaderboard";

const router = Router();

// Route to get all leaderboard entries
router.get("/", async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find().sort({ score: -1 });
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/id", async (req: Request<{ id: String }>, res) => {
  try {
    const myID = req.params.id;
  } catch (error) {
    res.status(400).send('No ID received: ' + error.message);
  }
  try {
    const myID = req.params.id;
    const me = await Leaderboard.findById(myID);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route to add a new leaderboard entry
router.post("/", async (req, res) => {
  const { name, score, date, timeTaken, playerID } = req.body;

  const leaderboardEntry = new Leaderboard({
    name,
    score,
    date: new Date(date), // Use the date provided by the client,
  });

  try {
    const newEntry = await leaderboardEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
