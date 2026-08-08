import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  createExpense,
  getExpenses,
  deleteExpense,
} from "../controllers/expense.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getExpenses).post(verifyAdmin, createExpense);
router.route("/:id").delete(verifyAdmin, deleteExpense);

export default router;
