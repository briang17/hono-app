import type { FormConfig } from "@formconfig/domain/form-config.entity";
import type { IFormConfigRepository } from "@formconfig/domain/interface.form-config.repository";
import type { CreateOpenHouseInput } from "../api/openhouse.schemas";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import type {
    NewOpenHouseLeadInput,
    PublicOpenHouse,
} from "../domain/openhouse.entity";
import { type OpenHouse, type OpenHouseLead } from "../domain/openhouse.entity";
export declare class OpenHouseService {
    private repository;
    private formConfigRepository;
    constructor(
        repository: IOpenHouseRepository,
        formConfigRepository: IFormConfigRepository,
    );
    createOpenHouse(
        data: CreateOpenHouseInput,
        organizationId: string,
        userId: string,
    ): Promise<OpenHouse>;
    getOpenHouses(organizationId: string, userId: string): Promise<OpenHouse[]>;
    getOpenHouse(id: string): Promise<OpenHouse | null>;
    getPublicOpenHouse(id: string): Promise<OpenHouse | null>;
    getPublicOpenHouseWithFormConfig(
        id: string,
    ): Promise<PublicOpenHouse | null>;
    deleteOpenHouse(id: string, organizationId: string): Promise<void>;
    createOpenHouseLead(
        openHouseId: string,
        data: NewOpenHouseLeadInput,
        organizationId: string,
    ): Promise<OpenHouseLead>;
    getOpenHouseLeads(openHouseId: string): Promise<OpenHouseLead[]>;
    getOpenHouseLeadsOrg(
        openHouseId: string,
        organizationId: string,
    ): Promise<OpenHouseLead[]>;
    getOpenHouseLeadsWithFormConfig(
        openHouseId: string,
        organizationId: string,
    ): Promise<{
        leads: OpenHouseLead[];
        formConfig: FormConfig | null;
    }>;
}
