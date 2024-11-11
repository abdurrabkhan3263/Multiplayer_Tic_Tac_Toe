import { Router } from "express";
import RoomController from "../controller/room.controller";

const router = Router();
const roomController = new RoomController();

router.route("/").get(roomController.getAllRooms);
router.route("/:userId").get(roomController.getUserRooms);
router.route("/create").post(roomController.createRoom);
router.route("/get-room/:roomId").get(roomController.getRoomById);

export default router;
