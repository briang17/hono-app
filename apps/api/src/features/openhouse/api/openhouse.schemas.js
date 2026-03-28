import { OpenHouseSchema, } from "@openhouse/domain/openhouse.entity";
import { z } from "zod";
/* GET /api/open-houses -> getOpenHouses() */
//no params or query for now
/* GET /api/open-houses/:id -> getOpenHouse() */
export const GetOpenHouseParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
/* GET /api/open-houses/:id/leads -> getOpenHouseLeads() */
export const GetOpenHouseLeadsParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
//no params, json or query for now
/* GET /api/open-houses/:id/public */
export const GetPublicOpenHouseParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
//no query or json for now
/* POST /api/open-houses/:id/sign-in */
export const CreateOpenHouseLeadParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
