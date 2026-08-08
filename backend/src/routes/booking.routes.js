import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} from "../controllers/booking.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createBooking);
router.route("/mine").get(getMyBookings);
router.route("/:id/cancel").patch(cancelBooking);
router.route("/all").get(verifyAdmin, getAllBookings);
router.route("/:id/status").patch(verifyAdmin, updateBookingStatus);

export default router;
