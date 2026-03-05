import { codes } from "@config/constants";
import { formConfigRoutes } from "@features/form-config/api/form-config.routes";
import {
    openhouseRoutes,
    publicOpenHouseRoutes,
} from "@features/openhouse/api/openhouse.routes";
import { auth } from "@packages/auth";
import { Hono } from "hono";
import { hc } from "hono/client";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

const routes = app
    .use(
        "/api/*",
        cors({
            origin: ["http://localhost:3000", "https://app.rs.hauntednuke.com"],
            credentials: true,
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
            exposeHeaders: ["Content-Length"],
            maxAge: 600,
        }),
    )
    .on(["POST", "GET"], "/api/auth/**", (c) => {
        return auth.handler(c.req.raw);
    })
    .route("/api/open-houses", openhouseRoutes)
    .route("/api/public/open-houses", publicOpenHouseRoutes)
    .route("/api/form-config", formConfigRoutes)
    .get("/health", (c) => {
        const toSeconds = 1000000000;
        return c.json({
            data: {
                uptime: (Bun.nanoseconds() / toSeconds).toFixed(2),
                currentTime: new Date(),
            },
        });
    })
    .onError((error, c) => {
        console.error("Error caught by handler:", error);

        if (error instanceof HTTPException) {
            return error.getResponse();
        }

        return c.json(
            {
                message: "error",
                details: error instanceof Error ? error.message : String(error),
            },
            codes.INTERNAL_SERVER_ERROR,
        );
    });

export default app;
export type AppType = typeof routes;
