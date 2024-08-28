import express from 'express';
import dotenv from 'dotenv';
import {calldb, addUser} from "./dbconfig";

dotenv.config()

const app = express();
const port = 8080;

const {GEMINI_API_KEY} = process.env;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY não foi definido');
}

app.get('/', async (req, res) => {
  const result = await calldb();
  console.log(result)
  res.send(`${result}`);
});

app.post('/upload', async (req, res) => {
  
})

app.listen(port, () => {
  console.log(`http://localhost:80`);
});