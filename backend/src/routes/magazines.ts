import { Router } from "express";
import { addNewMagazines } from "../controllers/magazines.js";
import { upload } from "../middlewares/multer.js";


const router = Router();


//api/v1/magazines/add-files
router.post("/add-files" , upload , addNewMagazines);


export default router;