import pino from "pino";
import { globalEnv } from "@packages/env";

const logger =
    globalEnv.NODE_ENV === "development"
        ? pino({
                transport: {
                    target: "pino-pretty",
                    options: { colorize: true },
                },
            })
        : pino(
                pino.destination({
                    dest: "logs/fub-worker.log",
                    mkdir: true,
                }),
            );

export { logger };
