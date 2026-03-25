import {
    type NewOpenHouseLeadSchema,
    type NewOpenHouseSchema,
    OpenHouseSchema,
} from "@openhouse/domain/openhouse.entity";
import { z } from "zod";

/* GET /api/open-houses -> getOpenHouses() */
//no params or query for now

/* GET /api/open-houses/:id -> getOpenHouse() */
export const GetOpenHouseParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
export type GetOpenHouseInput = undefined;
export type GetOpenHouseParams = z.infer<typeof GetOpenHouseParamsSchema>;
export type GetOpenHouseQuery = undefined;

/* GET /api/open-houses/:id/leads -> getOpenHouseLeads() */
export const GetOpenHouseLeadsParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
export type GetOpenHouseLeadsInput = undefined;
export type GetOpenHouseLeadsParams = z.infer<
    typeof GetOpenHouseLeadsParamsSchema
>;
export type GetOpenHouseLeadsQuery = undefined;

/* POST /api/open-houses/ -> createOpenHouse() */
export type CreateOpenHouseInput = z.infer<typeof NewOpenHouseSchema>;
//no params, json or query for now

/* GET /api/open-houses/:id/public */
export const GetPublicOpenHouseParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
export type GetPublicOpenHouseParams = z.infer<
    typeof GetPublicOpenHouseParamsSchema
>;
//no query or json for now

/* POST /api/open-houses/:id/sign-in */
export const CreateOpenHouseLeadParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
export type CreateOpenHouseLeadInput = z.infer<typeof NewOpenHouseLeadSchema>;
export type CreateOpenHouseLeadParams = z.infer<
    typeof CreateOpenHouseLeadParamsSchema
>;
