import OpenAI from "openai";
import { Message } from "./types";

export class OpenAITranslator {
  private readonly genAI: OpenAI;

  constructor(apiKey: string) {
    this.genAI = new OpenAI({
      apiKey,
    });
  }

  /*
   * This function translates the provided text to the desired language.
   *
   * @param {string} text: The text to be translated.
   * @param {string} language: The target language for translation.
   * @returns {string} The translated text.
   */
  async translate(text: string, language: string): Promise<Message> {
    const response = await this.genAI.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
            You will be provided with a sentence. Your tasks are to:
            - Detect what language the sentence is in
            - Translate the sentence into ${language}
            Do not return anything other than the translated sentence.
          `,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.7,
      max_tokens: 64,
      top_p: 1,
    });

    const result: Message = {
      content: response.choices[0].message.content || "",
    };

    return result;
  }
}
