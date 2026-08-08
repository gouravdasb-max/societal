import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getEvents).post(verifyAdmin, createEvent);
router.route("/:id").patch(verifyAdmin, updateEvent).delete(verifyAdmin, deleteEvent);

export default router;
