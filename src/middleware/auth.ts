import { ErrorHandler, asyncError } from "async-express-error-handler";
import jwt from "jsonwebtoken";
import { prisma } from "../controllers/userController";
import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";

// Custom interface for extending Request
export interface CustomRequest extends Request {
  user?: User | undefined | null; // Define user property with User type
}

export const isAuthenticated = asyncError(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { token } = req.cookies;

    if (!token) {
      return next(
        new ErrorHandler("Please Login to access this resource", 401)
      );
    }

    const jwt_secret: string = process.env.JWT_SEC || "development";
    const decodedData = jwt.verify(token, jwt_secret) as { id: string };

    req.user = await prisma.user.findFirst({ where: { id: decodedData.id } });

    next();
  }
);
