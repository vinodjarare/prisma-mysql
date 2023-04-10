import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";
import { asyncError } from "async-express-error-handler";

const getToken = asyncError(async (req: Request, res: Response, user: User) => {
  if (!process.env.JWT_SEC) {
    throw new Error("JWT secret is not defined in the environment variables.");
  }

  const token = await jwt.sign({ id: user.id }, process.env.JWT_SEC as Secret, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  res.json({ success: true, token });
});

export default getToken;
