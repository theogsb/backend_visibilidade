import { TemplateService } from "../services/templateService.js";
import fs from "fs";

const handleError = (res, error) => {
  res.status(500).json({
    success: false,
    message: error.message
  });
};

export class TemplateController {

  constructor() {
      this.service = new TemplateService();
    }

  async getTemplates(req, res) {
    try {
      const templates = await this.service.getTemplates();

      res.status(200).json({
        success: true,
        message: 'Templates enviados com Sucesso',
        data: templates
      });

    } catch (error) {
      handleError(res, error);
    }
  }

  async getTemplate(req, res) {
    try {
      const template = await this.service.getTemplate(req.params.templateId);


      res.status(200).json({
        success: true,
        message: 'Template enviado com sucesso!',
        data: template
      });

    } catch (error) {
      handleError(res, error);
    }
  }

  async createTemplate(req, res) {
    try {
      if (!req.file) {
        throw new Error('Template não encontrado!');
      }
      const file = req.file;
      const filePath = file.path;

      const imageUrl = `http://localhost:${process.env.PORT}/uploads/publicTemplates/${file.filename}`;

      const template = await this.service.createTemplate({
        imagePath: filePath , 
        imageUrl: imageUrl
      });

      res.status(201).json({
        success: true,
        message: 'Template criado com sucesso!',
        data: template
      });

    } catch (error) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        handleError(res, error);
    }
  }

  async updateTemplate(req, res) {
    try {
      if(!req.file) {
        throw new Error('Template não encontrado!');
      }
      const file = req.file;
      const filePath = file.path;
      const templateId = req.params.templateId;
      
      const imageUrl = `http://localhost:${process.env.PORT}/uploads/publicTemplates/${file.filename}`;

      const template = await this.service.updateTemplate(templateId, {
        imagePath: filePath , 
        imageUrl: imageUrl
      })

      res.status(200).json({
        success: true,
        message: 'Template atualizado com sucesso!',
        data: template
      });

    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      handleError(res, error);
    }
  }

  async deleteTemplate(req, res) {
    try {
      const template = await this.service.deleteTemplate(req.params.templateId);

      res.status(200).json({
        success: true,
        message: "Template excluído com sucesso!",
      });

    } catch (error) {
      handleError(res, error);
    }
  }
} 