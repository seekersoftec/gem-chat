import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "./types";

export class GoogleTranslator {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /*
   * This function translates the provided text to the desired language.
   *
   * @param {string} text: The text to be translated.
   * @param {string} language: The target language for translation.
   * @returns {string} The translated text.
   */
  async translate(text: string, language: string): Promise<Message> {
    const chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `
          You will be provided with a sentence. Your tasks are to:
          - Detect what language the sentence is in
          - Translate the sentence into ${language}
          Do not return anything other than the translated sentence.
        `,
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to know?" }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100, // 64, 100
        topP: 1,
      },
    });

    const msgResult = await chat.sendMessage(text);

    const result: Message = {
      content: await msgResult.response.text(),
    };

    return result;
  }
}
