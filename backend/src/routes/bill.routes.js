import express, { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  generateBills,
  getMyBills,
  getAllBills,
  markBillPaid,
  markBillOverdue,
  rejectBillVerification,
  payMyBill,
} from "../controllers/bill.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/mine").get(getMyBills);
router.route("/:id/pay").patch(payMyBill);
router.route("/all").get(verifyAdmin, getAllBills);
router.route("/generate").post(verifyAdmin, generateBills);
router.route("/:id/paid").patch(verifyAdmin, markBillPaid);
router.route("/:id/overdue").patch(verifyAdmin, markBillOverdue);
router.route("/:id/reject").patch(verifyAdmin, rejectBillVerification);

export default router;
