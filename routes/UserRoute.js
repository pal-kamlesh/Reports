import express from "express";
const router = express.Router();

import {
  allUsers,
  deleteUser,
  loginUser,
  registerUser,
  userReport,
} from "../controllers/UserController.js";
import { authenticateUser, authorizeUser } from "../middleware/auth.js";

router.route("/login").post(loginUser);
router
  .route("/register")
  .post(authenticateUser, authorizeUser("Admin", "Back Office"), registerUser);
router
  .route("/allUser")
  .get(authenticateUser, authorizeUser("Admin", "Back Office"), allUsers);
router
  .route("/details/:id")
  .get(authenticateUser, userReport)
  .delete(authenticateUser, authorizeUser("Admin"), deleteUser);

export default router;
