import { pool } from "../../../db";

export type CategorySpendingRow = {
  category: string;
  total_cents: string;
};

export type BudgetRow = {
  budget_category: string;
  monthly_limit_cents: string;
};

export type SubscriptionRenewalRow = {
  subscription_id: string;
  subscription_title: string;
  subscription_amount_cents: string;
  next_renewal_date: string;
  billing_cycle: string;
  subscription_status: string;
};

export const dashboardRepo = {
  async getTotalSpending(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await pool.query(
      `SELECT COALESCE(SUM(expense_amount_cents), 0) as total
       FROM expenses
       WHERE user_id = $1
       AND expense_date >= $2
       AND expense_date <= $3`,
      [userId, startDate, endDate]
    );
    return Number(result.rows[0].total);
  },

  async getCategorySpending(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CategorySpendingRow[]> {
    const result = await pool.query<CategorySpendingRow>(
      `SELECT
        expense_category as category,
        SUM(expense_amount_cents) as total_cents
       FROM expenses
       WHERE user_id = $1
       AND expense_date >= $2
       AND expense_date <= $3
       GROUP BY expense_category
       ORDER BY total_cents DESC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  },

  async getBudgets(userId: string, month: string): Promise<BudgetRow[]> {
    const result = await pool.query<BudgetRow>(
      `SELECT
        budget_category,
        monthly_limit_cents
       FROM budgets
       WHERE user_id = $1
       AND budget_month = $2`,
      [userId, month]
    );
    return result.rows;
  },

  async getUpcomingRenewals(userId: string): Promise<SubscriptionRenewalRow[]> {
    const result = await pool.query<SubscriptionRenewalRow>(
      `SELECT
        subscription_id,
        subscription_title,
        subscription_amount_cents,
        next_renewal_date,
        billing_cycle,
        subscription_status
       FROM subscriptions
       WHERE user_id = $1
       AND subscription_status IN ('active', 'trial')
       AND next_renewal_date IS NOT NULL
       ORDER BY next_renewal_date ASC`,
      [userId]
    );
    return result.rows;
  },
};
