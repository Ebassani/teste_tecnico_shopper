import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import {getUserFromCode, addMeasure, getMeasureFromId, confirmMeasure, getMeasuresFromUser, Measure, getSortedMeasuresFromUser, verifyMeasureMonth} from "./dbconfig";
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

app.patch('/confirm', verifyDataTypesConfirm, async (req, res) => {
  const { measure_uuid, confirmed_value } = req.body;

  const measure_array = await getMeasureFromId(measure_uuid);

  if (measure_array.length == 0){
    res.status(404).json({error_code: "MEASURE_NOT_FOUND", error_description: "Leitura do mês já realizada"})
  }

  const measure = measure_array[0];

  if (measure.has_confirmed) {
    res.status(409).json({error_code: "CONFIRMATION_DUPLICATE", error_description: "Leitura do mês já realizada"})
  }
  
  await confirmMeasure(measure.measure_uuid, confirmed_value)  

  res.status(200).json({success: true})
});

app.post('/upload', verifyDataTypesUpload, async (req, res) => {
  try {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    if (await verifyMeasureMonth(customer_code, new Date(measure_datetime), measure_type)) {
      res.status(409).json({ error_code: "DOUBLE_REPORT", error_description: "Leitura do mês já realizada" })
    }

    const gen_ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    const file_manager = new GoogleAIFileManager(GEMINI_API_KEY);

    const model = gen_ai.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const img_path = await createTempImageFile(image)

    const uploadResponse = await file_manager.uploadFile(img_path, {
      mimeType: "image/png",
      displayName: "Measure",
    });
    
    const temp_link = uploadResponse.file.uri;

    const result = await model.generateContent([
      {
          fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: temp_link
          }
      },
      { text: "Extract the numerical value on the image, send only the number as response" },
    ]);
    
    const value = Number.parseInt(result.response.text());

    await fs.remove(img_path);

    const measure_id = await addMeasure(customer_code, value,new Date(measure_datetime), temp_link, measure_type);

    res.status(200).json({image_url: temp_link, measure_value: value, measure_uuid: (measure_id.toString())});

  } catch (error) {
    res.status(500).json({ error_code: "UNEXPECTED_ERROR", error_description: "Possível falha ao se conectar com a API do GEMINI" });
  }
});

app.get('/:customer_code/list', async (req, res) => {
  const customer_code = req.params.customer_code;
  const user_array = await getUserFromCode(customer_code)

  const measure_type = req.query.measure_type;

  if (user_array.length == 0) {
    res.status(404).json({error_code: "MEASURES_NOT_FOUND", error_description: "Nenhuma leitura encontrada"})
  }

  const user = user_array[0];

  let measures;

  if (measure_type) {
    if (measure_type !== "WATER" && measure_type !== "GAS"){
      res.status(400).json({
        error_code: "INVALID_TYPE",
        error_description: "Tipo de medição não permitida"
        })
    }
    measures = await getSortedMeasuresFromUser(user.id, measure_type.toString());
  } else {
    measures = await getMeasuresFromUser(user.id);
  }


  if (measures.length == 0 || (measures as Measure[])[0].has_confirmed === undefined) {
    res.status(404).json({error_code: "MEASURES_NOT_FOUND", error_description: "Nenhuma leitura encontrada"})
  }

  const transformed_measures = (measures as Measure[]).map(measure => ({
    measure_uuid: measure.measure_uuid.toString(),
    measure_datetime: measure.measure_datetime,
    measure_type: measure.measure_type,
    has_confirmed: measure.has_confirmed,
    image_url: measure.image_url,
  }));

  res.status(202).json({customer_code: customer_code, measures: transformed_measures})

});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

function verifyDataTypesUpload(req: Request, res: Response, next: NextFunction) {
  const { image, customer_code, measure_datetime, measure_type } = req.body;

  const base_64_pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  if (typeof image !== 'string' || image.length % 4 !== 0 || !base_64_pattern.test(image)) {
    return res.status(400).json({ error_code: "INVALID_DATA", error_description: "image não é uma string base64" });
  }

  if (typeof customer_code !== 'string') {
    return res.status(400).json({ error_code: "INVALID_DATA", error_description: "customer_code não é do tipo \'string\'" });
  }

  if (isNaN(Date.parse(measure_datetime))) {
    return res.status(400).json({ error_code: "INVALID_DATA", error_description: "measure_datetime não é do tipo \'DATETIME\'" });
  }

  if (measure_type !== 'WATER' && measure_type !== 'GAS') {
    return res.status(400).json({ error_code: "INVALID_DATA", error_description: "measure_type precisa ser 'WATER' ou 'GAS'." });
  }

  next();
}

function verifyDataTypesConfirm(req: Request, res: Response, next: NextFunction) {
  const { measure_uuid, confirmed_value } = req.body;

  if (typeof measure_uuid !== 'string') {
    return res.status(404).json({error_code: "INVALID_DATA", error_description: "measure_uuid não é do tipo \'string\'"})
  }

  if (typeof confirmed_value !== 'number') {
    return res.status(404).json({error_code: "INVALID_DATA", error_description: "confirmed_value não é do tipo \'number\'"})
  }

  next()
}

async function createTempImageFile(base64: string) {
  try {
    const temp_file_path = path.join(__dirname, 'tempImage.png');
    
    const buffer = Buffer.from(base64, 'base64');
    await fs.writeFile(temp_file_path, buffer);

    return temp_file_path
  } catch (error) {
    throw Error()
  }
}
