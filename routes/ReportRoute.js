import express from "express";
const router = express.Router();

import {
  addPage,
  allReports,
  createReport,
  deleteReport,
  editReport,
  generateReport,
  imageUpload,
  newReport,
  reportDetails,
  sendEmail,
  submitReport,
} from "../controllers/ReportController.js";
import { authorizeUser } from "../middleware/auth.js";

router.route("/create").post(createReport);
router.route("/uploadImage").post(imageUpload);
router
  .route("/allReports")
  .get(authorizeUser("Admin", "Back Office"), allReports);
router
  .route("/sendEmail")
  .post(authorizeUser("Admin", "Back Office"), sendEmail);
router.route("/newReport/:id").post(newReport).patch(addPage);
router.route("/reportDetails/:id").patch(submitReport).get(reportDetails);
router
  .route("/editReport/:id")
  .patch(authorizeUser("Admin", "Back Office"), editReport)
  .delete(deleteReport);

router.route("/generate/:id").get(generateReport);

export default router;
