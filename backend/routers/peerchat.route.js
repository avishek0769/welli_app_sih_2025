import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { createChat, deleteChat } from '../controllers/peerchat.controller';

const peerChatRouter = Router();

peerChatRouter.route('/createChat/:peerId').get(auth, createChat)
peerChatRouter.route('/deleteChat/:peerId').get(auth, deleteChat)


export default peerChatRouter;