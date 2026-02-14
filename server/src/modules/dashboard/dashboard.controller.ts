import type { Response } from "express";
import type { AuthRequest } from "../auth/middlewares/requireAuth";
import { dashboardRepo } from "./repositories/dashboard.repo";

export const dashboardController = {
  async getSummary(req: AuthRequest, res: Response) {
    const userId = req.userId;

    // Get current month's date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch all data in parallel
    const [totalSpendingCents, categorySpendingRows, budgetsRows, upcomingRenewalsRows] =
      await Promise.all([
        dashboardRepo.getTotalSpending(userId, firstDayOfMonth, lastDayOfMonth),
        dashboardRepo.getCategorySpending(userId, firstDayOfMonth, lastDayOfMonth),
        dashboardRepo.getBudgets(
          userId,
          `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        ),
        dashboardRepo.getUpcomingRenewals(userId),
      ]);

    // Transform category spending to proper format
    const categorySpending = categorySpendingRows.map((row) => ({
      category: row.category,
      amount: Number(row.total_cents) / 100,
    }));

    // Calculate budget usage
    const budgetUsage = budgetsRows.map((budget) => {
      const spending = categorySpendingRows.find(
        (s) => s.category === budget.budget_category
      );
      const spentCents = spending ? Number(spending.total_cents) : 0;
      const limitCents = Number(budget.monthly_limit_cents);

      return {
        category: budget.budget_category,
        limit: limitCents / 100,
        spent: spentCents / 100,
        percentage: limitCents > 0 ? Math.round((spentCents / limitCents) * 100) : 0,
        status:
          spentCents > limitCents
            ? "over"
            : spentCents > limitCents * 0.9
            ? "warning"
            : "good",
      };
    });

    // Transform upcoming renewals
    const upcomingRenewals = upcomingRenewalsRows.map((row) => ({
      id: row.subscription_id,
      title: row.subscription_title,
      amount: Number(row.subscription_amount_cents) / 100,
      renewalDate: row.next_renewal_date,
      billingCycle: row.billing_cycle,
      status: row.subscription_status,
    }));

    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    res.json({
      totalSpending: totalSpendingCents / 100,
      categorySpending,
      budgetUsage,
      upcomingRenewals,
      currentMonth,
    });
  },
};
