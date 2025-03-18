import { Router } from "express";
import { addNewFiles, getEdition, getNewNewspapers, getPublication } from "../controllers/newspaper.js";
const router = Router();
router.get("/get-new-files", getNewNewspapers);
router.post("/add-files", addNewFiles);
router.get("/get-publication", getPublication);
router.get("/get-edition", getEdition);
export default router;
