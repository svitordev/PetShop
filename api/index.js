import express from "express";
import cors from "cors";
import userRoutes from "./routes/pets.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", userRoutes);

app.listen(8800);
