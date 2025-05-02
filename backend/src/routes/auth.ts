import { Router } from "express";
import { authenticatedUser } from "../middlewares/auth.js";

const router = Router();

router.get("/check" , authenticatedUser)

export default router


