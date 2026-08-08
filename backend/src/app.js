import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import helmet from "helmet";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import announcementRouter from "./routes/announcement.routes.js";
import venueRouter from "./routes/venue.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import chatRouter from "./routes/chat.routes.js";
import complaintRouter from "./routes/complaint.routes.js";
import pollRouter from "./routes/poll.routes.js";
import eventRouter from "./routes/event.routes.js";
import gatepassRouter from "./routes/gatepass.routes.js";
import expenseRouter from "./routes/expense.routes.js";
import billRouter from "./routes/bill.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";



const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: [
          "'self'",
          "http://localhost:5173",
          "http://*",
          "ws://localhost:8000",
          "ws://*",
          "wss://your-production-domain.com",
          "*"
        ],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Societal API is running" });
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/announcements", announcementRouter);
app.use("/api/v1/venues", venueRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/complaints", complaintRouter);
app.use("/api/v1/polls", pollRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/gatepasses", gatepassRouter);
app.use("/api/v1/expenses", expenseRouter);
app.use("/api/v1/bills", billRouter);
app.use(errorHandler);

export { app };
