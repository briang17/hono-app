import { type Job, Worker } from "bullmq";
import { fubApi } from "./fub-api";
import { connection } from "./connection";
import { logger } from "./logger";
import type { FubEventJobData } from "./types";

const QUEUE_NAME = "fub-queue";

const worker = new Worker<FubEventJobData>(
    QUEUE_NAME,
    async (job: Job<FubEventJobData>) => {
        const { person, property, type, system, source, message, description, note } =
            job.data;

        logger.info(
            {
                jobId: job.id,
                personName: `${person.firstName} ${person.lastName}`,
            },
            "Processing FUB event",
        );

        const eventPayload: Record<string, unknown> = {
            person,
            type,
            system,
            source,
        };

        if (property) eventPayload.property = property;
        if (message) eventPayload.message = message;
        if (description) eventPayload.description = description;

        const eventResponse = await fubApi.post("/events", eventPayload);

        logger.info(
            {
                jobId: job.id,
                status: eventResponse.status,
                data: eventResponse.data,
            },
            "FUB event created",
        );

        if (note && eventResponse.data) {
            const personId =
                eventResponse.data.personId ?? eventResponse.data.id;

            if (personId) {
                await fubApi.post("/notes", {
                    subject: note.subject,
                    body: note.body,
                    personId: personId,
                });

                logger.info({ jobId: job.id, personId }, "FUB note created");
            } else {
                logger.warn(
                    { jobId: job.id, responseData: eventResponse.data },
                    "No personId in event response, skipping note",
                );
            }
        }

        return { success: true };
    },
    {
        connection,
        concurrency: 1,
        limiter: {
            max: 20,
            duration: 10000,
        },
    },
);

worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Job completed");
});

worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Job failed");
});

worker.on("error", (err) => {
    logger.error({ error: err.message }, "Worker error");
});

logger.info({ queue: QUEUE_NAME }, "FUB worker started");
