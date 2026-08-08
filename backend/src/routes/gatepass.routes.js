import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { verifyGuard } from "../middlewares/guard.middleware.js";
import {
  createGatePass,
  getMyPasses,
  getAllPasses,
  updatePassStatus,
  cancelMyPass,
  scanGatePass,
  getGuardScanHistory,
} from "../controllers/gatepass.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createGatePass);
router.route("/mine").get(getMyPasses);
router.route("/:id/cancel").patch(cancelMyPass);
router.route("/all").get(verifyAdmin, getAllPasses);
router.route("/:id/status").patch(verifyAdmin, updatePassStatus);
router.route("/scan/pass").post(verifyGuard, scanGatePass);
router.route("/scan/history").get(verifyGuard, getGuardScanHistory);

export default router;
