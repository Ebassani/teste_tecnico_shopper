import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import {calldb, addUser, getUserFromCode} from "./dbconfig";
import { GoogleAIFileManager } from "@google/generative-ai/server";


dotenv.config()

const app = express();
const port = 8080;

const {GEMINI_API_KEY} = process.env;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY não foi definido');
}

app.get('/', async (req, res) => {
  const result = await getUserFromCode('test_user');
  console.log(result)
  res.send(`${result}`);
});

app.post('/upload', verifyDataTypes, async (req, res) => {


  try {
    const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

    const uploadResponse = await fileManager.uploadFile("jetpack.jpg", {
      mimeType: "image/jpeg",
      displayName: "Jetpack drawing",
    });
    

    console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

  } catch (error) {
      // Handle errors in the request to the external API
      return res.status(500).json({ error: 'Failed to connect to external API.', details: "error.message" });
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

function verifyDataTypes(req: Request, res: Response, next: NextFunction) {
  const { image, customer_code, measure_datetime, measure_type } = req.body;

  if (typeof image !== 'string') {
    return res.status(400).json({ error: "'image' must be a string." });
  }

  const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  if (image.length % 4 !== 0 || !base64Pattern.test(image)) {
    return res.status(400).json({ error: "'image' must be a string." });
  }

  if (typeof customer_code !== 'string') {
    return res.status(400).json({ error: "'customer_code' must be a string or a number." });
  }

  if (isNaN(Date.parse(measure_datetime))) {
    return res.status(400).json({ error: "'measure_datetime' must be a valid datetime string." });
  }

  if (measure_type !== 'WATER' && measure_type !== 'GAS') {
    return res.status(400).json({ error: "'measure_type' must be either 'WATER' or 'GAS'." });
  }

  next();
}
