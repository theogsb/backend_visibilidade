import express from "express";
import path from "path";
import cors from 'cors';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "../routes/userRoutes.js";
import scheduleRoutes from '../routes/scheduleRoutes.js';
import templateRoutes from "../routes/templateRoutes.js";
import textGeneratorRoutes from "../routes/textGeneratorRoutes.js";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/usersTemplates', express.static(path.join(__dirname, '../../uploads/usersTemplates')));
app.use('/uploads/publicTemplates', express.static(path.join(__dirname, '../../uploads/publicTemplates')));

app.use(userRoutes);
app.use(scheduleRoutes);
app.use(templateRoutes);
app.use(textGeneratorRoutes);

const server = app.listen(port, () => {
  console.log(`Rodando com express na porta ${port}!`);
});

export { app, server };
