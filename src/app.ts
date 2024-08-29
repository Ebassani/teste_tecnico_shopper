import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import {calldb, addUser, getUserFromCode} from "./dbconfig";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs-extra"


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
    const {image} = req.body;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

    const imgpath = await createTempImageFile(image)

    const uploadResponse = await fileManager.uploadFile(imgpath, {
      mimeType: "image/png",
      displayName: "Measure",
    });
    
    const result = await model.generateContent([
      {
          fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri
          }
      },
      { text: "Extract the numerical value on the image, send only the number as response" },
    ]);

    console.log(result.response.text())

    await fs.remove(imgpath);

    res.send(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to external API.', details: "error.message" });
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

async function createTempImageFile(base64: string) {
  try {
    const tempFilePath = path.join(__dirname, 'tempImage.png');
    
    const buffer = Buffer.from(base64, 'base64');
    await fs.writeFile(tempFilePath, buffer);

    return tempFilePath
  } catch (error) {
    return ""
  }
}
