import { openhouseRoutes } from "@features/openhouse/api/openhouse.routes";
import { logReq } from "@middlewares/temp.logging.middleware";
import { auth } from "@packages/auth";
import { postRoutes } from "@posts/api/post.routes";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

process.env.TZ = "UTC";

const app = new Hono();

app.use(
	"/api/*",
	cors({
		origin: ["http://localhost:3000", "https://app.rs.hauntednuke.com"],
		credentials: true,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

app.route("/api/open-houses", openhouseRoutes);
//app.route("/posts", postRoutes);

app.get("/health", (c) => {
	return c.json({
		data: {
			uptime: (Bun.nanoseconds() / 1000000000).toFixed(2),
			currentTime: new Date(),
		},
	});
});

/*app.onError((error, c) => {
    if (error instanceof HTTPException) {
        console.error(error.cause);
        return error.getResponse();
    }
    return c.json({ message: "error", details: error });
});*/

export default app;
