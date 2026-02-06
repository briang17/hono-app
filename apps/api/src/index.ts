import { logReq } from "@middlewares/temp.logging.middleware";
import { postRoutes } from "@posts/api/post.routes";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

process.env.TZ = "UTC";

const app = new Hono();

//app.use(logReq);

app.route("/posts", postRoutes);

app.post("/*", (c) => {
    return c.json({ message: "received!" });
});

app.get("/health", (c) => {
    return c.json({data: {
        uptime: (Bun.nanoseconds()/1000000000).toFixed(2),
        currentTime: new Date()
    }})
})

/*app.onError((error, c) => {
    if (error instanceof HTTPException) {
        console.error(error.cause);
        return error.getResponse();
    }
    return c.json({ message: "error", details: error });
});*/

export default app;
