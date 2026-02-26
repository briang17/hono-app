import { Queue } from "bullmq";
import { connection } from "./connection";

const myQueue = new Queue("email-queue", { connection });

async function addJobs() {
  console.log("Adding jobs to the queue...");

  // Add 10 jobs
  for (let i = 1; i <= 10; i++) {
    await myQueue.add("send-email", {
      email: `user${i}@example.com`,
      subject: "Welcome!",
      body: `Hello user ${i}, welcome to our platform.`
    });
    console.log(`Added job ${i}`);
  }

  // Add a delayed job (runs after 5 seconds)
  await myQueue.add("send-email", {
      email: "delayed@example.com",
      subject: "I am late",
      body: "Sorry for the delay"
  }, { delay: 5000 });
  
  console.log("Jobs added. Press Ctrl+C to exit.");
}

addJobs().catch(console.error);