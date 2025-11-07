import dotenv from "dotenv";
dotenv.config({
    path: "../.env"
});
import { Worker } from "bullmq";
import PeerMessage from "../models/peermessage.model.js";
import PeerChat from "../models/peerchat.model.js";
import mongoose from "mongoose";


let newMessagesBuffer = []
let seenMessagesBuffer = []
let flushTimer;
const TIME_INTERVAL = 15000;
const MAX_BATCH_SIZE = 50;
let isFlushingNewMessages = false;
let isFlushingSeenMessages = false;

const flushNewMessages = async () => {
    if (newMessagesBuffer.length === 0 || isFlushingNewMessages) return;
    isFlushingNewMessages = true
    console.log("Flushing")

    try {
        const messages = [...newMessagesBuffer];
        newMessagesBuffer = []

        const insertedMessages = await PeerMessage.insertMany(
            messages.map(
                ({ chat, sender, text, timestamp, receiver }) => {
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

        console.log(`Flushed ${messages.length} new messages`);
    }
    catch (err) {
        console.error("Error flushing new messages:", err);
    }
    finally {
        isFlushingNewMessages = false;
    }
}

const flushSeenMessages = async () => {
    if (isFlushingSeenMessages || seenMessagesBuffer.length == 0) return;
    isFlushingSeenMessages = true
    console.log("Flushing seen messages")
    
    try {
        let seenMessages = [...seenMessagesBuffer]
        seenMessagesBuffer = []
        const grouped = new Map();

        for (const { chatId, userId, receiverId } of seenMessages) {
            if (!grouped.has(chatId)) {
                grouped.set(chatId, { userIds: new Set(), receiverIds: new Set() });
            }
            grouped.get(chatId).userIds.add(userId);
            grouped.get(chatId).receiverIds.add(receiverId);
        }

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
        isFlushingSeenMessages = false;
    }
}

const messageWorker = new Worker("peerMessages", async job => {
    console.log(job.name, job.data);
    if(job.name == "new-message") {
        newMessagesBuffer.push(job.data)
    }
    else if(job.name == "seen-message") {
        seenMessagesBuffer.push(job.data)
    }

    if (newMessagesBuffer.length >= MAX_BATCH_SIZE) {
        clearTimeout(flushTimer)
        flushTimer = null;
        await flushNewMessages()
    }
    if (seenMessagesBuffer.length >= MAX_BATCH_SIZE) {
        clearTimeout(flushTimer)
        flushTimer = null;
        await flushSeenMessages()
    }
    if (!flushTimer) {
        flushTimer = setTimeout(async () => {
            try {
                await flushNewMessages()
                await flushSeenMessages()
            }
            catch (error) {
                console.error("Error in scheduled flush:", error);
            }
            finally {
                flushTimer = null;
            }
        }, TIME_INTERVAL);
    }
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    concurrency: 1,
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