import { cloudinaryEnv } from "@packages/env";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: cloudinaryEnv.CLOUDINARY_CLOUD_NAME,
    api_key: cloudinaryEnv.CLOUDINARY_CLOUD_API_KEY,
    api_secret: cloudinaryEnv.CLOUDINARY_CLOUD_API_SECRET,
    secure: true,
});

export { cloudinary };
