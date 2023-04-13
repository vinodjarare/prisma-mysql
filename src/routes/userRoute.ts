import express from "express";
import {
  deleteUser,
  getAllUser,
  getUser,
  login,
  register,
  updatePassword,
  updateUser,
} from "../controllers/userController";
import { isAuthenticated } from "../middleware/auth";
const router = express.Router();

router.route("/signup").post(register);
router.route("/login").post(login);
router.route("/user/:id").get(isAuthenticated, getUser);

router
  .route("/user")
  .put(isAuthenticated, updateUser)
  .delete(isAuthenticated, deleteUser)
  .patch(isAuthenticated, updatePassword);
router.route("/users").get(getAllUser);

export default router;
