import { Router } from "express";
import { addNewMagazines } from "../controllers/magazines.js";
import { upload } from "../middlewares/multer.js";
import { writeRoute } from "../middlewares/auth.js";
const router = Router();
//api/v1/magazines/add-files
router.post("/add-files", upload, writeRoute, addNewMagazines);
export default router;
