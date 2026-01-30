import { logReq } from "@middlewares/temp.logging.middleware";
import { postRoutes } from "@posts/api/post.routes";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.use(logReq);

app.route("/posts", postRoutes);

app.post("/*", (c) => {
    return c.json({ message: "received!" });
});

app.onError((error, c) => {
    if (error instanceof HTTPException) {
        console.error(error.cause);
        return error.getResponse();
    }
    return c.json({ message: "error", details: error });
});

export default app;
