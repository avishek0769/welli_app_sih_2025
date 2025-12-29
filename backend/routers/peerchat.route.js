import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { createChat, deleteChat, getChats, restoreChat } from '../controllers/peerchat.controller.js';

const peerChatRouter = Router();

peerChatRouter.route('/create/:peerId').post(auth, createChat)
peerChatRouter.route('/delete/:chatId').delete(auth, deleteChat)
peerChatRouter.route('/restore/:chatId').patch(auth, restoreChat)
peerChatRouter.route('/all').get(auth, getChats)


export default peerChatRouter;