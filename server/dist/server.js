"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// const mongoose = require('mongoose');
// mongoose.connect(process.env.DATABASE_URL)
// const db = mongoose.connection
// db.on('error', (error) => console.error(error))
// db.once('open', () => {console.log('Connected!')})
app.use(express_1.default.json());
const leaderboardRouter = require("./routes/leaderboard");
app.use("/leaderboard", leaderboardRouter);
const start = async () => {
    // await mongoose.connect(process.env.MONGODB_URI);
    app.listen(3000, () => console.log("Server Started."));
};
try {
    start();
}
catch (error) {
    console.log(error);
}
