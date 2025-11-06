import dotenv from "dotenv";
dotenv.config({
    path: "../.env"
});
import { Worker } from "bullmq";
import PeerMessage from "../models/peermessage.model.js";
import mongoose from "mongoose";


let flushTimer;
const FLUSH_INTERVAL = 15000;
const MAX_BATCH_SIZE = 50;
let isFlushing;
let seenMessagesBuffer = []

const flushMessage = async () => {
    if (isFlushing || seenMessagesBuffer.length == 0) return;
    isFlushing = true
    console.log("Flushing seen messages")
    
    try {
        let seenMessages = [...seenMessagesBuffer]
        seenMessagesBuffer = []
        const receiversList = new Set();
        const grouped = new Map();

        // Group updates by chatId
        for (const { chatId, userId, receiverId } of seenMessages) {
            receiversList.add(receiverId);

            if (!grouped.has(chatId)) {
                grouped.set(chatId, { userIds: new Set(), receiverIds: new Set() });
            }
            grouped.get(chatId).userIds.add(userId);
            grouped.get(chatId).receiverIds.add(receiverId);
        }

        // Update readBy arrays for all chats
        const bulkOps = [];
        for (const [chatId, { userIds }] of grouped.entries()) {
            bulkOps.push({
                updateMany: {
                    filter: { chat: chatId, readBy: { $nin: [...userIds] } },
                    update: { $addToSet: { readBy: { $each: [...userIds] } } }
                }
            });
        }
        if (bulkOps.length > 0) {
            await PeerMessage.bulkWrite(bulkOps);
        }

        console.log(`Flushed seen messages for ${seenMessages.length} entries`);
    }
    catch (error) {
        console.error("Error flushing seen messages:", error);
    }
    finally {
        isFlushing = false;
    }
}

const messageSeenWorker = new Worker("peerMessagesSeen", async (job) => {
    console.log(job.name, job.data)
    seenMessagesBuffer.push(job.data)

    if (seenMessagesBuffer.length >= MAX_BATCH_SIZE) {
        await flushMessage()
        clearTimeout(flushTimer)
        flushTimer = null
        return
    }
    if (!flushTimer) {
        flushTimer = setTimeout(async () => {
            await flushMessage()
            flushTimer = null
        }, FLUSH_INTERVAL);
    }
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    concurrency: 5,
    limiter: {
        max: 100,
        duration: 2000
    }
})

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Message seen Worker connected to MongoDB");
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

export default messageSeenWorker