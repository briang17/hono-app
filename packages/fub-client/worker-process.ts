import "./worker";

import { logger } from "./logger";

logger.info("Starting FUB worker process...");

process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down...");
    process.exit(0);
});

process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down...");
    process.exit(0);
});
