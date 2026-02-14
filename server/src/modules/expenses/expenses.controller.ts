import type { Response } from "express";
import type { AuthRequest } from "../auth/middlewares/requireAuth";
import { CreateExpenseSchema, ListExpensesQuerySchema, UpdateExpenseSchema } from "./expenses.schemas";
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
    const q = ListExpensesQuerySchema.parse(req.query);
    console.log("parsed query:", q);
    const expenses = await expensesRepo.listByUser(req.userId, q);
    res.json(expenses);
  },

  async getOne(req: AuthRequest, res: Response) {
    const expense = await expensesRepo.findById(
      req.userId,
      req.params.id as string
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  },

  async update(req: AuthRequest, res: Response) {
    const parsed = UpdateExpenseSchema.parse(req.body);

    const updated = await expensesRepo.update(
      req.userId,
      req.params.id as string,
      parsed
    );

    if (!updated) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(updated);
  },

  async remove(req: AuthRequest, res: Response) {
    const deleted = await expensesRepo.delete(
      req.userId,
      req.params.id as string
    );

    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(204).send();
  },
};
