import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createVenue,
  getVenues,
  updateVenue,
  deleteVenue,
} from "../controllers/venue.controller.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getVenues)
  .post(verifyAdmin, upload.single("image"), createVenue);
router
  .route("/:id")
  .patch(verifyAdmin, updateVenue)
  .delete(verifyAdmin, deleteVenue);

export default router;
