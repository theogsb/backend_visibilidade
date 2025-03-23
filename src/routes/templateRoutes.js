import express from "express";
import { publicUpload } from "../multer/multer.js";
import { TemplateController } from "../controllers/templateController.js";

const router = express.Router();
const templateController = new TemplateController();

router.get("/template/", templateController.getTemplates.bind(templateController));
router.get("/template/:templateId", templateController.getTemplate.bind(templateController));
router.post("/template", publicUpload.single('imagePath'), templateController.createTemplate.bind(templateController));
router.patch("/template/:templateId", publicUpload.single('imagePath'), templateController.updateTemplate.bind(templateController));
router.delete("/template/:templateId", templateController.deleteTemplate.bind(templateController));

export default router;
