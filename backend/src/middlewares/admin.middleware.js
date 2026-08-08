import { ApiError } from "../utils/ApiError.js";

export const verifyAdmin = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Admins only. You do not have access to this resource.");
  }
  next();
};
