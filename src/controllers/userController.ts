import { NextFunction, Request, Response } from "express";
import { asyncError, ErrorHandler } from "async-express-error-handler";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../middleware/auth";
export const prisma = new PrismaClient();

export const register = asyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const user = await prisma.user.findFirst({ where: { email } });
    if (user?.email === email)
      return next(new ErrorHandler("user already present", 401));

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(Date.now()),
      },
    });

    if (!process.env.JWT_SEC) {
      throw new Error(
        "JWT secret is not defined in the environment variables."
      );
    }

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SEC, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    const cookie_expire: string = process.env.COOKIE_EXPIRE || "2";

    res
      .status(201)
      .cookie("token", token, {
        expires: new Date(
          Date.now() + parseInt(cookie_expire) * 24 * 60 * 60 * 1000
        ),
      })
      .json({
        sucess: true,
        message: "signup sucessful!",
      });
  }
);

export const login = asyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // If user not found or password doesn't match
      return next(new ErrorHandler("Invalid credentials", 403));
    }

    // Do further processing or return response
    // For example, you can generate a JWT token for authentication and return it in response
    if (!process.env.JWT_SEC) {
      throw new Error(
        "JWT secret is not defined in the environment variables."
      );
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SEC, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(
          Date.now() +
            parseInt(process.env.COOKIE_EXPIRE || "1") * 24 * 60 * 60 * 1000
        ),
      })
      .json({
        sucess: true,
        message: "Login sucessful!",
      });
  }
);

export const updateUser = asyncError(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ErrorHandler("you are not logged in", 403));
    let userId = req.user.id;
    const { name, email } = req.body;

    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) return next(new ErrorHandler("user not found", 404));

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
      },
    });

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  }
);

export const updatePassword = asyncError(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ErrorHandler("you are not logged in", 403));
    let userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log(req.body);

    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) return next(new ErrorHandler("user not found", 404));
    console.log(user);
    const comparedPassword = await bcrypt.compare(oldPassword, user.password);
    console.log("compared Password", comparedPassword);
    if (!comparedPassword)
      return next(new ErrorHandler("wrong old password", 401));

    if (newPassword !== confirmPassword)
      return next(
        new ErrorHandler(
          "new password and confirm password should be same",
          402
        )
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedPassword = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      success: true,
      user: updatedPassword,
    });
  }
);

export const deleteUser = asyncError(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ErrorHandler("you are not logged in", 403));
    let userId = req.user.id;

    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) return next(new ErrorHandler("user not found", 404));

    await prisma.user.delete({ where: { id: userId } });

    res
      .status(200)
      .json({ success: true, message: "user deleted successfully" });
  }
);

export const getUser = asyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) return next(new ErrorHandler("user not found", 404));

    res.status(200).json({ success: true, user });
  }
);

export const getAllUser = asyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany();
    if (!users) return next(new ErrorHandler("user not found", 404));

    res.status(200).json({ success: true, users });
  }
);
