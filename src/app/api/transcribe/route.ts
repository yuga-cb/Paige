import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const configuration = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI();

export async function POST(req: NextRequest) {
  console.log('POST request received');

  if (!configuration.apiKey) {
    console.log('OpenAI API key not configured');
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    console.log('Parsing form data');
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      console.log('No audio file provided');
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    console.log('Audio file received');

    // Create a temporary file
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      console.log('Creating temporary directory');
      fs.mkdirSync(tempDir);
    }
    const tempFilePath = path.join(tempDir, `temp_audio_${Date.now()}.wav`);
    console.log(`Temporary file path: ${tempFilePath}`);
    
    // Write the blob to the temporary file
    console.log('Writing audio data to temporary file');
    const bytes = await audioFile.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(bytes));

    // Send the file to OpenAI's Whisper API
    console.log('Sending file to OpenAI Whisper API');
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath) as any,
      model: "whisper-1"
    });

    // Delete the temporary file
    console.log('Deleting temporary file');
    fs.unlinkSync(tempFilePath);

    console.log('Transcription successful');
    return NextResponse.json({ transcription: response.text });
  } catch (error: any) {
    console.error('Error occurred:', error);
    return NextResponse.json({ error: error.message || "An error occurred during transcription" }, { status: 500 });
  }
}
