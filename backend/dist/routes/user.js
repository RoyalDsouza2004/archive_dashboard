import { Router } from "express";
import { addUser, getUser } from "../controllers/user.js";
const router = Router();
router.post('/new', addUser);
router.get('/:userId', getUser);
export default router;
