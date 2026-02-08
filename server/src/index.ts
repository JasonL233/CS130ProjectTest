import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ==================== SUBSCRIPTIONS API ====================

// GET all subscriptions for a user (mock user_id for now)
app.get("/api/subscriptions", async (_req, res) => {
  try {
    // TODO: Get user_id from authentication
    // For now, we'll get all subscriptions or use a mock user_id
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
      ORDER BY
        next_renewal_date IS NULL,
        next_renewal_date ASC`
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

    // TODO: Get user_id from authentication
    // For now, we'll need to create a mock user or handle this differently
    // Let's create a default user_id for testing
    const mockUserId = "00000000-0000-0000-0000-000000000000";

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
        mockUserId,
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

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API http://localhost:${port}`));
