import { Router } from "express";
import RoomController from "../controller/room.controller";

const router = Router();
const roomController = new RoomController();

router.route("/").get(roomController.getAllRooms);
router.route("/:roomName").get(roomController.getRoomByName);
router.route("/create").post(roomController.createRoom);

export default router;
