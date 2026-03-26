import { Queue } from "bullmq";
import { connection } from "./connection";
import type { InvitationEmailData } from "./lib/render-email";

export const emailQueue = new Queue<InvitationEmailData>("email-queue", {
	connection,
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 2000,
		},
	},
});

export async function addInvitationEmailJob(data: InvitationEmailData) {
	return await emailQueue.add("send-invitation-email", data, {
		removeOnComplete: 100,
		removeOnFail: 500,
	});
}
