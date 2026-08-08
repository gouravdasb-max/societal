import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAnnouncements).post(verifyAdmin, createAnnouncement);
router
  .route("/:id")
  .patch(verifyAdmin, updateAnnouncement)
  .delete(verifyAdmin, deleteAnnouncement);

export default router;
