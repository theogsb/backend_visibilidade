import express from "express";
import { ScheduleController } from '../controllers/scheduleControllers.js';
import { usersUpload } from '../multer/multer.js';

const router = express.Router();
const scheduleController = new ScheduleController();

router.get("/schedule/:userId", scheduleController.getSchedule.bind(scheduleController));
router.get("/schedule/:userId/posts/:postId", scheduleController.getPost.bind(scheduleController));
router.post("/schedule/:userId/posts", usersUpload.single("imagePath"), scheduleController.createPost.bind(scheduleController));
router.patch("/schedule/:userId/posts/:postId", usersUpload.single("imagePath"), scheduleController.updatePost.bind(scheduleController));
router.delete("/schedule/:userId/posts/:postId", scheduleController.deletePost.bind(scheduleController));

export default router;