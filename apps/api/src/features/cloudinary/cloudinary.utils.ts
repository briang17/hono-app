import { cloudinary } from "./cloudinary.config";

export async function deleteCloudinaryImages(
    publicIds: string[],
): Promise<void> {
    if (publicIds.length === 0) return;

    await Promise.all(
        publicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId).catch((err) => {
                console.error(
                    `Failed to delete Cloudinary image ${publicId}:`,
                    err,
                );
            }),
        ),
    );
}
