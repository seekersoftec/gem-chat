import { NextResponse } from 'next/server'
import { GoogleTranslator, OpenAITranslator } from '@/lib/translators'

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '' // process.env.OPENAI_API_KEY || "";
const translator = new GoogleTranslator(apiKey) // new OpenAITranslator(apiKey);

export async function POST(request: Request) {
  const { text, language } = await request.json()

  const response = await translator.translate(text, language)

  return NextResponse.json({
    text: response.content
  })
}
