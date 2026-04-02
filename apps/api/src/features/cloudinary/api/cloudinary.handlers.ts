import { zValidator } from "@hono/zod-validator";
import { orgFactory } from "@lib/factory";
import { cloudinaryEnv } from "@packages/env";
import { z } from "zod";
import { cloudinary } from "../cloudinary.config";

export const getConfigHandlers = orgFactory.createHandlers((c) => {
    return c.json({
        data: {
            cloudName: cloudinaryEnv.CLOUDINARY_CLOUD_NAME,
            apiKey: cloudinaryEnv.CLOUDINARY_CLOUD_API_KEY,
            folder: "open-houses",
        },
    });
});

export const getSignatureHandlers = orgFactory.createHandlers(
    zValidator("json", z.record(z.string(), z.unknown())),
    (c) => {
        const paramsToSign = c.req.valid("json");

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            cloudinaryEnv.CLOUDINARY_CLOUD_API_SECRET,
        );

        return c.json({
            data: {
                signature,
                timestamp: paramsToSign.timestamp,
                apiKey: cloudinaryEnv.CLOUDINARY_CLOUD_API_KEY,
            },
        });
    },
);
