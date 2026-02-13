import { pool } from "../../../db";

export type ExpenseRow = {
  expense_id: string;
  user_id: string;
  expense_title: string;
  expense_category: string;
  expense_amount_cents: number;
  expense_date: string;
  expense_note: string | null;
  created_at: string;
};

export const expensesRepo = {
  async create(
    userId: string,
    dto: {
      title: string;
      category: string;
      amount_cents: number;
      date: string;
      note?: string;
    }
  ): Promise<ExpenseRow> {
    const { rows } = await pool.query<ExpenseRow>(
      `INSERT INTO expenses
        (user_id, expense_title, expense_category, expense_amount_cents, expense_date, expense_note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, dto.title, dto.category, dto.amount_cents, dto.date, dto.note ?? null]
    );
    return rows[0];
  },
};
