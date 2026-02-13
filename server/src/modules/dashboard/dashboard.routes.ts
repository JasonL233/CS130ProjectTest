import { Router } from "express";
import { requireAuth } from "../auth/middlewares/requireAuth";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { dashboardController } from "./dashboard.controller";

export const dashboardRouter = Router();

// TODO(Auth): replace placeholder requireAuth with real auth middleware
dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", asyncHandler(dashboardController.getSummary));
