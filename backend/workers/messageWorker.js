import dotenv from "dotenv";
dotenv.config({
    path: "../.env"
});
import { Worker } from "bullmq";
import PeerMessage from "../models/peermessage.model.js";
import PeerChat from "../models/peerchat.model.js";
import mongoose from "mongoose";


let messageBuffer = []
let flushTimer;
const TIME_INTERVAL = 15000;
const MAX_BATCH_SIZE = 50;
let isFlushing = false;

const flushMessage = async () => {
    if (messageBuffer.length === 0 || isFlushing) return;
    isFlushing = true
    console.log("Flushing")

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

        console.log(`Flushed ${messages.length} messages`);
    }
    catch (err) {
        console.error("Error flushing messages:", err);
    }
    finally {
        isFlushing = false;
    }
}

const messageWorker = new Worker("peerMessages", async job => {
    console.log("Job received:", job.name, job.data);
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
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    concurrency: 5,
    limiter: {
        max: 100,
        duration: 1000
    }
})

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Message Worker connected to MongoDB");
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});


export default messageWorker