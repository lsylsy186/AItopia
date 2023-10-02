
import fs from 'fs';
import { Readable } from 'stream';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const elevenLabsAPI = "https://api.elevenlabs.io/v1";

// Need to adapt from elevenlabs-node because of https://github.com/FelixWaweru/elevenlabs-node/issues/16
const textToSpeech = async (
  apiKey: string | undefined,
  voiceID: string,
  fileName: string,
  textInput: string,
  stability?: number,
  similarityBoost?: number,
  modelId?: string,
) => {
  try {
    if (!apiKey || !voiceID || !fileName || !textInput) {
      console.log("ERR: Missing parameter");
    }

    const voiceURL = `${elevenLabsAPI}/text-to-speech/${voiceID}`;
    const stabilityValue = stability ? stability : 0;
    const similarityBoostValue = similarityBoost ? similarityBoost : 0;

    const response = await axios({
      method: "POST",
      url: voiceURL,
      data: {
        text: textInput,
        voice_settings: {
          stability: stabilityValue,
          similarity_boost: similarityBoostValue,
        },
        model_id: modelId ? modelId : "eleven_monolingual_v1",
      },
      headers: {
        Accept: "audio/mpeg",
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      responseType: "stream",
    });

    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(fileName);
      response.data.pipe(writeStream);

      writeStream.on('finish', () => resolve(fileName));
      writeStream.on('error', reject);
    });

  } catch (error) {
    console.log(error);
  }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { text, voiceId } = req.body;

  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  const filePath = "/tmp/audio.mp3";

  try {
    await textToSpeech(apiKey, voiceId, filePath, text).then((responseFilePath) => {
      console.log(responseFilePath);
    });

    const audioStream = fs.createReadStream(filePath);

    audioStream.on('end', () => {
      fs.unlinkSync(filePath); // Delete the file after streaming
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    audioStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating audio' });
  }
};