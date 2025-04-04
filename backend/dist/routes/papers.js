import { Router } from "express";
import { getEdition, getPublication, searchPapers } from "../controllers/paper.js";
import { readRoute } from "../middlewares/auth.js";
const router = Router();
//api/v1/papers/get-publication
router.get("/get-publication", getPublication);
//api/v1/papers/get-edition?publicationId=id
router.get("/get-edition", getEdition);
//api/v1/papers/search?
router.get("/search", readRoute, searchPapers);
export default router;
