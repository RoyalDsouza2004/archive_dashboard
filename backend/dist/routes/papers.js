import { Router } from "express";
import { getEdition, getPublication } from "../controllers/paper.js";
const router = Router();
//api/v1/papers/get-publication
router.get("/get-publication", getPublication);
//api/v1/news-papers/get-edition?publicationId=id
router.get("/get-edition", getEdition);
export default router;
