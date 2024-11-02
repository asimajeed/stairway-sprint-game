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
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
exports.connectDB = connectDB;
exports.query = query;
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_CA,
    },
};
const client = new pg_1.Client(config);
exports.client = client;
async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to the database!");
        const result = await client.query("SELECT VERSION()");
        console.log("PostgreSQL version:", result.rows[0].version);
    }
    catch (err) {
        console.error("Connection error:", err);
        process.exit(1);
    }
}
async function query(text, params) {
    try {
        const result = await client.query(text, params);
        return result;
    }
    catch (err) {
        console.error("Query error:", err);
        throw err;
    }
}
connectDB();
