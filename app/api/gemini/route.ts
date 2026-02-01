import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // API key check 
    const apiKey = process.env.GEMINI_API_KEY;

    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }


    // Gemini model initialize 
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    console.log('Sending request to Gemini...');

    // AI response generate 
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Response received from Gemini');

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Gemini API Error Details:', error);
    
    // Specific error messages
    if (error.message?.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { error: 'Invalid API Key. Please check your Gemini API key.' },
        { status: 401 }
      );
    }
    

    return NextResponse.json(
      { error: 'Failed to get AI response: ' + error.message },
      { status: 500 }
    );
  }
}