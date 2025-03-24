import dotenv from "dotenv";
dotenv.config();

const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_KEY}`;

export class TextGeneratorService {
  async generateText(prompt) {
    try {
      if (!prompt) {
        throw new Error("Campo 'prompt' é obrigatório");
      }
  
      const response = await fetch(API_URL, {
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
      });
  
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;    
       
    } catch( error ) {
      throw new Error(error.message);
    }
  }
}
