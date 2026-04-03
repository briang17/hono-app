import { Queue } from "bullmq";
import { connection } from "./connection";
import type { FubEventJobData } from "./types";

export const fubQueue = new Queue<FubEventJobData>("fub-queue", {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});

export async function addFubEventJob(data: FubEventJobData) {
    return await fubQueue.add("send-fub-event", data);
}
