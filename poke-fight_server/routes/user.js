import express from 'express'
import { getUser, postUser, putUser, getUsers } from '../controllers/user.js'
import { checkUser, checkData } from '../middlewares/user.js';

const userRouter = express.Router();

userRouter.get('/', getUser);
userRouter.get('/all', getUsers);
userRouter.post('/', checkData, postUser);
userRouter.put('/:id', checkUser, putUser);

export default userRouter;