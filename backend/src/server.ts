import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";

dotenv.config();

const app = express();
const server = createServer(app);

// Middlewares

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import roomRoute from "./routes/room.route";

app.use("/room", roomRoute);

// Error handler
import ErrorHandler from "./middleware/errorHandler";

app.use(ErrorHandler);

export default server;
