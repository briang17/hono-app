import { Job, Worker } from "bullmq";
import { Resend } from "resend";
import { connection } from "./connection";
import { renderInvitationEmail, type InvitationEmailData } from "./lib/render-email";
import { emailerEnv } from "@packages/env";

const resend = new Resend(emailerEnv.RESEND_API_KEY);

const workerName = "email-queue";

const worker = new Worker<InvitationEmailData>(
	workerName,
	async (job: Job<InvitationEmailData>) => {
		const { email, organizationName} = job.data;

		console.log(`[Worker ${job.id}] Processing invitation email for ${email}...`);

		const html = await renderInvitationEmail(job.data);

		const { error } = await resend.emails.send({
			from: emailerEnv.RESEND_FROM_EMAIL,
			to: email,
			subject: `You're invited to join ${organizationName}`,
			html,
		});

		if (error) {
			throw new Error(`Resend error: ${error.message}`);
		}

		console.log(`[Worker ${job.id}] Email sent successfully to ${email}`);
		return { success: true };
	},
	{
		connection,
		concurrency: 5,
		limiter: {
			max: 10,
			duration: 1000,
		},
	},
);

worker.on("completed", (job) => {
	console.log(`[Worker ${job.id}] Completed!`);
});

worker.on("failed", (job, err) => {
	console.error(`[Worker ${job?.id}] Failed: ${err.message}`);
});

console.log(`[Worker] Worker started on queue: ${workerName}`);
