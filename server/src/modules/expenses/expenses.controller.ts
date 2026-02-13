import type { Response } from "express";
import type { AuthRequest } from "../auth/middlewares/requireAuth";
import { CreateExpenseSchema } from "./expenses.schemas";
import { expensesRepo } from "./repositories/expenses.repo";

export const expensesController = {
  async create(req: AuthRequest, res: Response) {
    const dto = CreateExpenseSchema.parse(req.body);

    const expense = await expensesRepo.create(req.userId, {
      title: dto.title,
      category: dto.category,
      amount_cents: dto.amount_cents,
      date: dto.date,
      note: dto.note,
    });

    return res.status(201).json({ expense });
  },
  async list(req: AuthRequest, res: Response) {
    res.json({ message: "not implemented yet" });
  },

  async getOne(req: AuthRequest, res: Response) {
    res.json({ message: "not implemented yet" });
  },

  async update(req: AuthRequest, res: Response) {
    res.json({ message: "not implemented yet" });
  },

  async remove(req: AuthRequest, res: Response) {
    res.json({ message: "not implemented yet" });
  },
};
