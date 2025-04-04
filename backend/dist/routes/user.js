import { Router } from "express";
import { addOrUpdateUserPermission, addUser, getAllUsers, getUser, loginUser } from "../controllers/user.js";
import { isAdmin } from "../middlewares/auth.js";
const router = Router();
router.post('/new', isAdmin, addUser);
router.post('/login', loginUser);
router.get('/all', isAdmin, getAllUsers);
router.route('/:userId').get(isAdmin, getUser).put(isAdmin, addOrUpdateUserPermission);
export default router;
