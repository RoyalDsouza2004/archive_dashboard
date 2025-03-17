import { Router } from "express";
import { addNewFiles, getNewNewspapers } from "../controllers/newspaper.js";


const router = Router();

router.get("/getNewFiles" , getNewNewspapers)

router.post("/add-files" , addNewFiles)


export default router;