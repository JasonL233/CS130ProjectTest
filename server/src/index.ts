import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { expensesRouter } from "./modules/expenses/expenses.routes";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/expenses", expensesRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API http://localhost:${port}`));
