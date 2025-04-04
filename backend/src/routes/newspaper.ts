import { Router } from "express";
import { addNewNewsPapers, getNewNewspapers } from "../controllers/newspaper.js";
import { writeRoute } from "../middlewares/auth.js";


const router = Router();


//api/v1/news-papers/get-new-files
router.get("/get-new-files" ,writeRoute, getNewNewspapers)

//api/v1/news-papers/add-files
router.post("/add-files" ,writeRoute, addNewNewsPapers);


export default router;