import "dotenv/config";
import express from "express";
import cors from "cors";
import pokemonRouter from "./routes/pokemon.js";
import userRouter from "./routes/user.js";
import { connectDatabase } from "./data/client.js";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use("/pokemon", pokemonRouter);
app.use("/user", userRouter);


const startServer = async () => {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch(error => {
  console.log(error, 'failes to start server')
})