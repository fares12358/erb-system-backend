import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  getDashboardStats,
  getChartData,
  getProductStats,
  getDashboard
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", protect, getDashboardStats);
router.get("/charts", protect, getChartData);
router.get("/products", protect, getProductStats);
router.get("/", protect, getDashboard);
export default router;
