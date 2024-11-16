import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";

dotenv.config();

const app = express();
const server = createServer(app);

// Middlewares

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import roomRoute from "./routes/room.route";
import socketRoute from "./routes/socket.route";

app.use("/api/room", roomRoute);
app.use("/api/socket", socketRoute);

// Error handler
import ErrorHandler from "./middleware/errorHandler";

app.use(ErrorHandler);

export default server;
