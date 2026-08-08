import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getAllResidents,
  approveResident,
  removeResident,
  getProfile,
  updateProfile,
  updateAvatar,
  getResidentDirectory,
  deleteProfile,
  getAllGuards,
  removeGuard,
} from "../controllers/user.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/profile").get(getProfile).patch(updateProfile).delete(deleteProfile);
router.route("/avatar").patch(upload.single("avatar"), updateAvatar);
router.route("/directory").get(getResidentDirectory);

import { getSocietySettings, updateSocietySettings } from "../controllers/user.controller.js";
router.route("/society/settings").get(verifyAdmin, getSocietySettings).patch(verifyAdmin, updateSocietySettings);
router.route("/residents").get(verifyAdmin, getAllResidents);
router.route("/residents/:userId/approve").patch(verifyAdmin, approveResident);
router.route("/residents/:userId").delete(verifyAdmin, removeResident);
router.route("/guards").get(verifyAdmin, getAllGuards);
router.route("/guards/:userId").delete(verifyAdmin, removeGuard);

export default router;

