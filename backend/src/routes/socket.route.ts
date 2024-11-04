import { Router } from "express";
import SocketController from "../controller/socket.controller";

const router = Router();
const socketController = SocketController.getInstance();
const namespace = "/game";

router.route("/").get();

export default router;
