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

  async listByUser(
    userId: string,
    q: {
      from?: string;
      to?: string;
      category?: string;
      title?: string;
      limit?: number;
    }
  ) {
    const where: string[] = ["user_id = $1"];
    const values: any[] = [userId];
    let i = 2;

    if (q.from) {
      where.push(`expense_date >= $${i++}`);
      values.push(q.from);
    }

    if (q.to) {
      where.push(`expense_date <= $${i++}`);
      values.push(q.to);
    }

    if (q.category) {
      where.push(`expense_category = $${i++}`);
      values.push(q.category);
    }

    if (q.title) {
      where.push(`expense_title ILIKE $${i++}`);
      values.push(`%${q.title}%`);
    }

    const limit = q.limit ?? 50;
    values.push(limit);

    const { rows } = await pool.query(
      `
      SELECT *
      FROM expenses
      WHERE ${where.join(" AND ")}
      ORDER BY expense_date DESC, created_at DESC
      LIMIT $${i}
      `,
      values
    );

    return rows;
  },

  async findById(userId: string, expenseId: string) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM expenses
      WHERE expense_id = $1 AND user_id = $2
      `,
      [expenseId, userId]
    );

    return rows[0] ?? null;
  },

  async delete(userId: string, expenseId: string) {
    const { rowCount } = await pool.query(
      `
      DELETE FROM expenses
      WHERE expense_id = $1 AND user_id = $2
      `,
      [expenseId, userId]
    );

    return rowCount;
  },

  async update(
    userId: string,
    expenseId: string,
    data: any
  ) {
    const fields = [];
    const values = [];
    let index = 1;

  const colMap: Record<string, string> = {
    title: "expense_title",
    category: "expense_category",
    amount_cents: "expense_amount_cents",
    date: "expense_date",
    note: "expense_note",
  };

  for (const key in data) {
    const col = colMap[key];
    if (!col) continue; // ignore unknown keys safely
    fields.push(`${col} = $${index}`);
    values.push(data[key]);
    index++;
  }

  if (fields.length === 0) {
    return await this.findById(userId, expenseId);
  }

    const { rows } = await pool.query(
      `
      UPDATE expenses
      SET ${fields.join(", ")}
      WHERE expense_id = $${index} AND user_id = $${index + 1}
      RETURNING *
      `,
      [...values, expenseId, userId]
    );

    return rows[0] ?? null;
  }
};
