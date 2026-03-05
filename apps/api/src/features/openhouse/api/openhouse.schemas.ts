import type { ToCtx } from "@lib/types";
import {
    type NewOpenHouseLeadInput,
    type NewOpenHouseSchema,
    OpenHouseSchema,
} from "@openhouse/domain/openhouse.entity";
import { z } from "zod";

/* GET /api/open-houses -> getOpenHouses() */
export type GetOpenHousesCtx = ToCtx<undefined, undefined, undefined>;

/* GET /api/open-houses/:id -> getOpenHouse() */
export const GetOpenHouseParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
export type GetOpenHouseInput = undefined;
type GetOpenHouseParams = z.infer<typeof GetOpenHouseParamsSchema>;
type GetOpenHouseQuery = undefined;

export type GetOpenHouseCtx = ToCtx<
    GetOpenHouseInput,
    GetOpenHouseParams,
    GetOpenHouseQuery
>;

/* GET /api/open-houses/:id/leads -> getOpenHouseLeads() */
export const GetOpenHouseLeadsParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
export type GetOpenHouseLeadsInput = undefined;
type GetOpenHouseLeadsParams = z.infer<typeof GetOpenHouseLeadsParamsSchema>;
type GetOpenHouseLeadsQuery = undefined;

export type GetOpenHouseLeadsCtx = ToCtx<
    GetOpenHouseLeadsInput,
    GetOpenHouseLeadsParams,
    GetOpenHouseLeadsQuery
>;

/* POST /api/open-houses/ -> createOpenHouse() */
export type CreateOpenHouseInput = z.infer<typeof NewOpenHouseSchema>;
export type CreateOpenHouseCtx = ToCtx<
    CreateOpenHouseInput,
    undefined,
    undefined
>;

/* GET /api/open-houses/:id/public */
export const GetPublicOpenHouseParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
type GetPublicOpenHouseParams = z.infer<typeof GetPublicOpenHouseParamsSchema>;

export type GetPublicOpenHouseCtx = ToCtx<
    undefined,
    GetPublicOpenHouseParams,
    undefined
>;

/* POST /api/open-houses/:id/sign-in */
export const CreateOpenHouseLeadParamsSchema = z.object({
    id: OpenHouseSchema.shape.id,
});
export type CreateOpenHouseLeadInput = z.infer<typeof NewOpenHouseLeadInput>;
type CreateOpenHouseLeadParams = z.infer<
    typeof CreateOpenHouseLeadParamsSchema
>;

export type CreateOpenHouseLeadCtx = ToCtx<
    CreateOpenHouseLeadInput,
    CreateOpenHouseLeadParams,
    undefined
>;
