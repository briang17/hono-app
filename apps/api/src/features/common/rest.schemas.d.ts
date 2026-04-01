import { z } from "zod/v4";
export declare const BaseQuerySchema: z.ZodObject<
    {
        createdFrom: z.ZodCoercedDate<unknown>;
        createdAfter: z.ZodCoercedDate<unknown>;
        userId: z.ZodUUID;
    },
    z.core.$strip
>;
