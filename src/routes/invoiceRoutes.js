import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getInvoices,
  updateInvoice
} from "../controllers/invoiceController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* All routes protected */

router.post("/", protect, createInvoice);

router.get("/", protect, getInvoices);

router.put("/:id", protect, updateInvoice);

router.delete("/:id", protect, deleteInvoice);

export default router;
    