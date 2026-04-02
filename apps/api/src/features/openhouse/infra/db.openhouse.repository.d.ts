import type { Id } from "@features/common/values";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import {
    type NewOpenHouseImageInput,
    type OpenHouse,
    type OpenHouseImage,
    type OpenHouseLead,
    type PublicOpenHouse,
} from "../domain/openhouse.entity";
export declare class DbOpenHouseRepository implements IOpenHouseRepository {
    create(params: Omit<OpenHouse, "images">): Promise<{
        id: string;
        organizationId: string;
        createdByUserId: string;
        propertyAddress: string;
        listingPrice: number;
        date: Date;
        startTime: string;
        endTime: string;
        images: {
            id: string;
            openHouseId: string;
            url: string;
            publicId: string;
            isMain: boolean;
            orderIndex: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
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
        images: {
            id: string;
            openHouseId: string;
            url: string;
            publicId: string;
            isMain: boolean;
            orderIndex: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
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
            images: {
                id: string;
                openHouseId: string;
                url: string;
                publicId: string;
                isMain: boolean;
                orderIndex: number;
                createdAt: Date;
            }[];
            createdAt: Date;
            updatedAt: Date;
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
        images: {
            id: string;
            openHouseId: string;
            url: string;
            publicId: string;
            isMain: boolean;
            orderIndex: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
        notes?: string | null | undefined;
    } | null>;
    findPublicByIdWithFormConfig(id: string): Promise<PublicOpenHouse | null>;
    createImages(
        openHouseId: string,
        images: NewOpenHouseImageInput[],
    ): Promise<OpenHouseImage[]>;
    findImagesByOpenHouseId(openHouseId: string): Promise<OpenHouseImage[]>;
    findImagePublicIdsByOpenHouseId(openHouseId: string): Promise<string[]>;
    delete(openHouseId: string): Promise<void>;
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
            | Record<string, string | number | string[] | number[]>
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
                | Record<string, string | number | string[] | number[]>
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
                | Record<string, string | number | string[] | number[]>
                | null
                | undefined;
        }[]
    >;
}
