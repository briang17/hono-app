import { Worker, Job } from "bullmq";
import { connection } from "./connection";

// define the shape of your job data
interface EmailJobData {
  email: string;
  subject: string;
  body: string;
}

const workerName = "email-queue";

const worker = new Worker<EmailJobData>(
  workerName,
  async (job: Job<EmailJobData>) => {
    console.log(`[Job ${job.id}] Processing email for ${job.data.email}...`);
    
    // Simulate async work (e.g., sending an email)
    await new Promise((resolve) => setTimeout(resolve, 700));
    
    if (Math.random() > 0.91) {
        throw new Error("Random email service failure!");
    }

    console.log(`[Job ${job.id}] Email sent successfully!`);
    return { status: "sent", timestamp: Date.now() };
  },
  {
    connection,
    concurrency: 5, // Process 5 jobs at the same time
    limiter: {
        max: 10,
        duration: 1000 // Rate limit: Max 10 jobs per second
    }
  }
);

// Event listeners for logging
worker.on("completed", (job) => {
  console.log(`[Job ${job.id}] Completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`[Job ${job?.id}] Failed: ${err.message}`);
});

console.log(`Worker listening on queue: ${workerName}`);