import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyGuard = asyncHandler(async (req, _res, next) => {
  if (req.user?.role !== "guard") {
    throw new ApiError(403, "Only security guards can access this resource");
  }
  next();
});
