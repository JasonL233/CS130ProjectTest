import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";
import { expensesRouter } from "./modules/expenses/expenses.routes";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ==================== DASHBOARD API ====================

// GET dashboard summary data
app.get("/api/dashboard/summary", async (_req, res) => {
  try {
    // Using mock user for now
    const userId = "00000000-0000-0000-0000-000000000000";

    // Get current month's date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get total spending this month (from expenses)
    const totalSpendingResult = await pool.query(
      `SELECT COALESCE(SUM(expense_amount_cents), 0) as total
       FROM expenses
       WHERE user_id = $1
       AND expense_date >= $2
       AND expense_date <= $3`,
      [userId, firstDayOfMonth, lastDayOfMonth]
    );

    // Get spending by category this month
    const categorySpendingResult = await pool.query(
      `SELECT
        expense_category as category,
        SUM(expense_amount_cents) as total_cents
       FROM expenses
       WHERE user_id = $1
       AND expense_date >= $2
       AND expense_date <= $3
       GROUP BY expense_category
       ORDER BY total_cents DESC`,
      [userId, firstDayOfMonth, lastDayOfMonth]
    );

    // Get budget information for current month
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const budgetsResult = await pool.query(
      `SELECT
        budget_category,
        monthly_limit_cents
       FROM budgets
       WHERE user_id = $1
       AND budget_month = $2`,
      [userId, currentMonth]
    );

    // Get upcoming subscription renewals (all active and trial subscriptions)
    const upcomingRenewalsResult = await pool.query(
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

    // Calculate budget usage
    const budgetUsage = budgetsResult.rows.map(budget => {
      const spending = categorySpendingResult.rows.find(
        s => s.category === budget.budget_category
      );
      const spentCents = spending ? Number(spending.total_cents) : 0;
      const limitCents = Number(budget.monthly_limit_cents);

      return {
        category: budget.budget_category,
        limit: limitCents / 100,
        spent: spentCents / 100,
        percentage: limitCents > 0 ? Math.round((spentCents / limitCents) * 100) : 0,
        status: spentCents > limitCents ? 'over' : spentCents > limitCents * 0.9 ? 'warning' : 'good'
      };
    });

    res.json({
      totalSpending: Number(totalSpendingResult.rows[0].total) / 100,
      categorySpending: categorySpendingResult.rows.map(row => ({
        category: row.category,
        amount: Number(row.total_cents) / 100
      })),
      budgetUsage,
      upcomingRenewals: upcomingRenewalsResult.rows.map(row => ({
        id: row.subscription_id,
        title: row.subscription_title,
        amount: Number(row.subscription_amount_cents) / 100,
        renewalDate: row.next_renewal_date,
        billingCycle: row.billing_cycle,
        status: row.subscription_status
      })),
      currentMonth: currentMonth
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

// ==================== SUBSCRIPTIONS API ====================

// GET all subscriptions for a user
app.get("/api/subscriptions", async (_req, res) => {
  try {
    // Using mock user for now
    const userId = "00000000-0000-0000-0000-000000000000";

    const result = await pool.query(
      `SELECT
        subscription_id,
        subscription_title,
        subscription_category,
        subscription_amount_cents,
        billing_cycle,
        next_renewal_date,
        subscription_status,
        subscription_note,
        created_at
      FROM subscriptions
      WHERE user_id = $1
      ORDER BY
        next_renewal_date IS NULL,
        next_renewal_date ASC`,
      [userId]
    );

    // Convert cents to dollars for frontend
    const subscriptions = result.rows.map((row) => ({
      ...row,
      subscription_amount: row.subscription_amount_cents / 100,
    }));

    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// POST create a new subscription
app.post("/api/subscriptions", async (req, res) => {
  try {
    const {
      subscription_title,
      subscription_category,
      subscription_amount,
      billing_cycle,
      next_renewal_date,
      subscription_status,
      subscription_note,
    } = req.body;

    // Validate required fields
    if (!subscription_title || !subscription_category || !subscription_amount || !billing_cycle || !subscription_status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Using mock user for now
    const userId = "00000000-0000-0000-0000-000000000000";

    // Convert dollars to cents
    const amount_cents = Math.round(subscription_amount * 100);

    const result = await pool.query(
      `INSERT INTO subscriptions (
        user_id,
        subscription_title,
        subscription_category,
        subscription_amount_cents,
        billing_cycle,
        next_renewal_date,
        subscription_status,
        subscription_note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        subscription_id,
        subscription_title,
        subscription_category,
        subscription_amount_cents,
        billing_cycle,
        next_renewal_date,
        subscription_status,
        subscription_note,
        created_at`,
      [
        userId,
        subscription_title,
        subscription_category,
        amount_cents,
        billing_cycle,
        next_renewal_date || null,
        subscription_status,
        subscription_note || null,
      ]
    );

    const newSubscription = {
      ...result.rows[0],
      subscription_amount: result.rows[0].subscription_amount_cents / 100,
    };

    res.status(201).json(newSubscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

// PUT update an existing subscription
app.put("/api/subscriptions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subscription_title,
      subscription_category,
      subscription_amount,
      billing_cycle,
      next_renewal_date,
      subscription_status,
      subscription_note,
    } = req.body;

    // Convert dollars to cents
    const amount_cents = Math.round(subscription_amount * 100);

    const result = await pool.query(
      `UPDATE subscriptions
      SET
        subscription_title = $1,
        subscription_category = $2,
        subscription_amount_cents = $3,
        billing_cycle = $4,
        next_renewal_date = $5,
        subscription_status = $6,
        subscription_note = $7
      WHERE subscription_id = $8
      RETURNING
        subscription_id,
        subscription_title,
        subscription_category,
        subscription_amount_cents,
        billing_cycle,
        next_renewal_date,
        subscription_status,
        subscription_note,
        created_at`,
      [
        subscription_title,
        subscription_category,
        amount_cents,
        billing_cycle,
        next_renewal_date || null,
        subscription_status,
        subscription_note || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const updatedSubscription = {
      ...result.rows[0],
      subscription_amount: result.rows[0].subscription_amount_cents / 100,
    };

    res.json(updatedSubscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Failed to update subscription" });
  }
});

// DELETE a subscription
app.delete("/api/subscriptions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM subscriptions WHERE subscription_id = $1 RETURNING subscription_id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.json({ success: true, subscription_id: id });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ error: "Failed to delete subscription" });
  }
});

app.use("/api/expenses", expensesRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API http://localhost:${port}`));
