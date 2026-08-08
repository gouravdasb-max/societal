import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
} from "../controllers/complaint.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(upload.single("image"), createComplaint);
router.route("/mine").get(getMyComplaints);
router.route("/all").get(verifyAdmin, getAllComplaints);
router.route("/:id").patch(verifyAdmin, updateComplaintStatus);

export default router;
