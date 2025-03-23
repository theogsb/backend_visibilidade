import express from "express";
import { UserController } from "../controllers/userController.js";

const router = express.Router();
const userController = new UserController();

router.post("/usergov", userController.createUser.bind(userController));
router.get("/usergov/:userId", userController.getUser.bind(userController));
router.patch("/usergov/:userId", userController.updateUser.bind(userController));

export default router;
