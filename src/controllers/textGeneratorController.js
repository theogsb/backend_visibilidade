import { TextGeneratorService } from "../services/textGeneratorService.js";

const handleError = (res, error) => {
  res.status(500).json({
    success: false,
    message: error.message
  });
};

export class TextGeneratorController {
  constructor() {
    this.service = new TextGeneratorService();
  }

  async generateText(req, res) {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        throw new Error("Campo 'prompt' é obrigatório");
      }
        
      const result = await this.service.generateText(prompt); 

      res.status(200).json({
        success: true,
        message: "Resposta gerada com sucesso!",
        data: result
      });
      
    } catch (error) {
        handleError(res, error);
    }
  }
}