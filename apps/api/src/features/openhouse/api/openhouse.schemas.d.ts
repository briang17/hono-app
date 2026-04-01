import {
    type NewOpenHouseLeadSchema,
    type NewOpenHouseSchema,
} from "@openhouse/domain/openhouse.entity";
import { z } from "zod";
export declare const GetOpenHouseParamsSchema: z.ZodObject<
    {
        id: z.ZodUUID;
    },
    z.core.$strip
>;
export type GetOpenHouseInput = undefined;
export type GetOpenHouseParams = z.infer<typeof GetOpenHouseParamsSchema>;
export type GetOpenHouseQuery = undefined;
export declare const GetOpenHouseLeadsParamsSchema: z.ZodObject<
    {
        id: z.ZodUUID;
    },
    z.core.$strip
>;
export type GetOpenHouseLeadsInput = undefined;
export type GetOpenHouseLeadsParams = z.infer<
    typeof GetOpenHouseLeadsParamsSchema
>;
export type GetOpenHouseLeadsQuery = undefined;
export type CreateOpenHouseInput = z.infer<typeof NewOpenHouseSchema>;
export declare const GetPublicOpenHouseParamsSchema: z.ZodObject<
    {
        id: z.ZodUUID;
    },
    z.core.$strip
>;
export type GetPublicOpenHouseParams = z.infer<
    typeof GetPublicOpenHouseParamsSchema
>;
export declare const CreateOpenHouseLeadParamsSchema: z.ZodObject<
    {
        id: z.ZodUUID;
    },
    z.core.$strip
>;
export type CreateOpenHouseLeadInput = z.infer<typeof NewOpenHouseLeadSchema>;
export type CreateOpenHouseLeadParams = z.infer<
    typeof CreateOpenHouseLeadParamsSchema
>;
