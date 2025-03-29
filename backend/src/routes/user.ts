import { Router } from "express";
import { addOrUpdateUserPermission, addUser, getAllUsers, getUser } from "../controllers/user.js";

const router = Router()

router.post('/new' , addUser);
router.get('/all' , getAllUsers);
router.route('/:userId').get(getUser).put(addOrUpdateUserPermission)


export default router;