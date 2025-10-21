import { Worker } from "bullmq";
import { connection } from "mongoose";
import PeerMessage from "../models/peermessage.model";
import PeerChat from "../models/peerchat.model";

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
        messageBuffer = []

        const insertedMessages = await PeerMessage.insertMany(
            messages.map(
                ({ chat, sender, text, timestamp }) => ({
                    chat,
                    sender,
                    text,
                    timestamp
                })
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