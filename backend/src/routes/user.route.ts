import { Router } from "express";
import UserController from "../controller/user.controller";

const router = Router();
const userController = new UserController();

router.route("/:userId").get(userController.getUser);
router.route("/").post(userController.createUser);

export default router;
