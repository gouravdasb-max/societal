import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMessages } from "../controllers/chat.controller.js";

const router = Router();

router.route("/messages").get(verifyJWT, getMessages);

export default router;
