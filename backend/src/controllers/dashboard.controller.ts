import type { Response } from "express";

import type { AuthRequest } from "../middlewares/protectRoute.middleware";

import { get_DashboardData } from "../services/dashboard.service";

export const controller_get_DashboardData = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.id;

    const dashboardData = await get_DashboardData(userId);

    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (error: any) {
    console.error(`Error in controller_get_DashboardData: ${error.message}`);
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
