import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { createChat, deleteChat, getChats } from '../controllers/peerchat.controller.js';

const peerChatRouter = Router();

peerChatRouter.route('/create/:peerId').get(auth, createChat)
peerChatRouter.route('/delete/:chatId').delete(auth, deleteChat)
peerChatRouter.route('/get').get(auth, getChats)


export default peerChatRouter;