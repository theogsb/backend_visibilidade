import { TextGeneratorService } from "../../src/services/textGeneratorService.js";
import dotenv from "dotenv";

dotenv.config();

global.fetch = jest.fn();

describe("TextGeneratorService", () => {
  let service;

  beforeEach(() => {
    service = new TextGeneratorService();
    fetch.mockClear();
  });

  it("deve gerar texto com sucesso quando o prompt for fornecido", async () => {
    const prompt = "Escreva uma história sobre um dragão.";
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: "Era uma vez um dragão que vivia nas montanhas...",
              },
            ],
          },
        },
      ],
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await service.generateText(prompt);

    expect(fetch).toHaveBeenCalledWith(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    expect(result).toBe(mockResponse.candidates[0].content.parts[0].text);
  });

  it("deve lançar um erro se o prompt não for fornecido", async () => {
    await expect(service.generateText()).rejects.toThrow("Campo 'prompt' é obrigatório");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("deve lançar um erro se a API falhar", async () => {
    const prompt = "Escreva uma história sobre um dragão.";
    const errorMessage = "Erro na API";

    fetch.mockRejectedValue(new Error(errorMessage));

    await expect(service.generateText(prompt)).rejects.toThrow(errorMessage);
  });
});