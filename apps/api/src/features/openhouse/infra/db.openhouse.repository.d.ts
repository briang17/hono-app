import type { Id } from "@features/common/values";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import {
    type OpenHouse,
    type OpenHouseLead,
    type PublicOpenHouse,
} from "../domain/openhouse.entity";
export declare class DbOpenHouseRepository implements IOpenHouseRepository {
    create(params: OpenHouse): Promise<{
        id: string;
        organizationId: string;
        createdByUserId: string;
        propertyAddress: string;
        listingPrice: number;
        date: Date;
        startTime: string;
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        listingImageUrl?: string | null | undefined;
        notes?: string | null | undefined;
    }>;
    findById(id: Id): Promise<{
        id: string;
        organizationId: string;
        createdByUserId: string;
        propertyAddress: string;
        listingPrice: number;
        date: Date;
        startTime: string;
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        listingImageUrl?: string | null | undefined;
        notes?: string | null | undefined;
    } | null>;
    findByOrgAndUser(
        organizationId: string,
        userId: string,
    ): Promise<
        {
            id: string;
            organizationId: string;
            createdByUserId: string;
            propertyAddress: string;
            listingPrice: number;
            date: Date;
            startTime: string;
            endTime: string;
            createdAt: Date;
            updatedAt: Date;
            listingImageUrl?: string | null | undefined;
            notes?: string | null | undefined;
        }[]
    >;
    findPublicById(id: string): Promise<{
        id: string;
        organizationId: string;
        createdByUserId: string;
        propertyAddress: string;
        listingPrice: number;
        date: Date;
        startTime: string;
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        listingImageUrl?: string | null | undefined;
        notes?: string | null | undefined;
    } | null>;
    findPublicByIdWithFormConfig(id: string): Promise<PublicOpenHouse | null>;
    createLead(params: OpenHouseLead): Promise<{
        id: string;
        openHouseId: string;
        organizationId: string;
        firstName: string;
        lastName: string;
        workingWithAgent: boolean;
        submittedAt: Date;
        consent: boolean;
        email?: string | null | undefined;
        phone?: string | null | undefined;
        responses?:
            | Record<string | number | symbol, unknown>
            | null
            | undefined;
    }>;
    findLeadsByOpenHouseId(openHouseId: string): Promise<
        {
            id: string;
            openHouseId: string;
            organizationId: string;
            firstName: string;
            lastName: string;
            workingWithAgent: boolean;
            submittedAt: Date;
            consent: boolean;
            email?: string | null | undefined;
            phone?: string | null | undefined;
            responses?:
                | Record<string | number | symbol, unknown>
                | null
                | undefined;
        }[]
    >;
    findLeadsByOpenHouseIdAndOrg(
        openHouseId: string,
        organizationId: string,
    ): Promise<
        {
            id: string;
            openHouseId: string;
            organizationId: string;
            firstName: string;
            lastName: string;
            workingWithAgent: boolean;
            submittedAt: Date;
            consent: boolean;
            email?: string | null | undefined;
            phone?: string | null | undefined;
            responses?:
                | Record<string | number | symbol, unknown>
                | null
                | undefined;
        }[]
    >;
}
