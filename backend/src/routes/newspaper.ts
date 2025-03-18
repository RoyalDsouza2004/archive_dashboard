import { Router } from "express";
import { addNewNewsPapers, getNewNewspapers } from "../controllers/newspaper.js";


const router = Router();


//api/v1/news-papers/get-new-files
router.get("/get-new-files" , getNewNewspapers)

//api/v1/news-papers/add-files
router.post("/add-files" , addNewNewsPapers);


export default router;