import dotenv from "dotenv";
dotenv.config({
    path: "../.env"
});
import { Worker } from "bullmq";
import PeerMessage from "../models/peermessage.model.js";
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

        await PeerMessage.insertMany(
            messages.map(
                ({ _id, chat, sender, text, timestamp }) => {
                    return {
                        _id: new mongoose.Types.ObjectId(_id),
                        chat,
                        sender,
                        text,
                        timestamp,
                        readBy: [sender]
                    }
                }
            )
        )

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
        
        const bulkOps = [];
        
        for (const { chatId, userId, messageIds } of seenMessages) {
            if (messageIds && messageIds.length > 0) {
                bulkOps.push({
                    updateMany: {
                        filter: { _id: { $in: messageIds }, readBy: { $ne: userId } },
                        update: { $addToSet: { readBy: userId } }
                    }
                });
            } else {
                bulkOps.push({
                    updateMany: {
                        filter: { chat: chatId, readBy: { $ne: userId } },
                        update: { $addToSet: { readBy: userId } }
                    }
                });
            }
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