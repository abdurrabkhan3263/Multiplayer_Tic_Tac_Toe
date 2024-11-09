import { Router } from "express";
import SocketController from "../controller/socket.controller";

const router = Router();

router.route("/").get();

export default router;
