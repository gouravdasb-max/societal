import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  createPoll,
  getPolls,
  vote,
  closePoll,
  deletePoll,
} from "../controllers/poll.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getPolls).post(verifyAdmin, createPoll);
router.route("/:id/vote").patch(vote);
router.route("/:id/close").patch(verifyAdmin, closePoll);
router.route("/:id").delete(verifyAdmin, deletePoll);

export default router;
