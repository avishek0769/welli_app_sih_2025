import { Worker } from "bullmq";
import { connection } from "mongoose";
import PeerMessage from "../models/peermessage.model";
import PeerChat from "../models/peerchat.model";
import User from "../models/user.model";
import { io } from "../app";

let messageBuffer = []
let flushTimer;
const TIME_INTERVAL = 15000;
const MAX_BATCH_SIZE = 50;
let isFlushing = false;

const flushMessage = async () => {
    if (messageBuffer.length === 0 || isFlushing) return;
    isFlushing = true

    try {
        const messages = [...messageBuffer];
        let receiversList = []
        let chatByUserMap = new Map()
        messageBuffer = []

        const insertedMessages = await PeerMessage.insertMany(
            messages.map(
                ({ chat, sender, text, timestamp, receiver }) => {
                    if (!receiversList.includes(receiver)) {
                        receiversList.push(receiver)
                        chatByUserMap.set(chat, receiver)
                    }
                    return {
                        chat,
                        sender,
                        text,
                        timestamp,
                        readBy: [sender]
                    }
                }
            )
        )

        const latestMessageByChat = new Map()
        for (const msg of insertedMessages) {
            latestMessageByChat.set(msg.chat, msg._id)
        }

        let bulkOps = []
        for (const [chatId, msgId] of latestMessageByChat) {
            bulkOps.push({
                updateOne: {
                    filter: { _id: chatId },
                    update: { $set: { lastMessage: msgId } }
                }
            })
        }
        if (bulkOps.length) await PeerChat.bulkWrite(bulkOps);

        const receivers = await User.find( // TODO: Optimise getting socket ID
            { _id: { $in: receiversList } },
            { isActive: 1, socketId: 1 }
        )
        
        let chatByUserEntries = [...chatByUserMap.entries()]
        receivers.filter(receiver => receiver.isActive).map(receiver => {
            let chatId = chatByUserEntries.find(([chat, user]) => user.toString() == receiver._id)?.[0]
            if(chatId) {
                io.to(receiver.socketId).emit("checkForNewMessages", chatId)
            }
        })

        console.log(`Flushed ${messages.length} messages`);
    }
    catch (err) {
        console.error("Error flushing messages:", err);
    }
    finally {
        isFlushing = false;
    }
}

const messageWorker = new Worker("peerMessage-worker", async job => {
    messageBuffer.push(job.data);

    if (messageBuffer.length >= MAX_BATCH_SIZE) {
        await flushMessage()
        clearTimeout(flushTimer)
        flushTimer = null;
        return;
    }
    if (!flushTimer) {
        flushTimer = setTimeout(async () => {
            await flushMessage()
            flushTimer = null;
        }, TIME_INTERVAL);
    }
}, {
    connection,
    concurrency: 5,
    limiter: {
        max: 100,
        duration: 1000
    }
})

export default messageWorker