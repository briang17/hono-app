import "./worker";

console.log("[Worker] Starting email worker process...");

process.on("SIGTERM", () => {
	console.log("[Worker] SIGTERM received, shutting down...");
	process.exit(0);
});

process.on("SIGINT", () => {
	console.log("[Worker] SIGINT received, shutting down...");
	process.exit(0);
});
