import { ErrorRequestHandler } from "express";
import { HTTP_STATUS } from "../config/http.config";
import { AppError, ErrorCodes } from "../utils/app-error";

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
): any => {
  console.log(`Error occurred: ${req.path}`, error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "Something went wrong",
    errorCode: ErrorCodes.ERR_INTERNAL,
  });
};