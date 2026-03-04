import type {
    CreateOpenHouseInput,
    CreateOpenHouseLeadInput,
} from "../api/openhouse.schemas";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import {
    type OpenHouse,
    OpenHouseFactory,
    type OpenHouseLead,
    OpenHouseLeadFactory,
} from "../domain/openhouse.entity";

export class OpenHouseService {
    constructor(private repository: IOpenHouseRepository) {}

    async createOpenHouse(
        data: CreateOpenHouseInput,
        organizationId: string,
        userId: string,
    ): Promise<OpenHouse> {
        const openHouse = OpenHouseFactory.create(data, organizationId, userId);

        return await this.repository.create(openHouse);
    }

    async getOpenHouses(
        organizationId: string,
        userId: string,
    ): Promise<OpenHouse[]> {
        return await this.repository.findByOrgAndUser(organizationId, userId);
    }

    async getOpenHouse(id: string): Promise<OpenHouse | null> {
        return await this.repository.findById(id);
    }

    async getPublicOpenHouse(id: string): Promise<OpenHouse | null> {
        return await this.repository.findPublicById(id);
    }

    async createOpenHouseLead(
        openHouseId: string,
        data: CreateOpenHouseLeadInput,
        organizationId: string,
    ): Promise<OpenHouseLead> {
        const lead = OpenHouseLeadFactory.create(
            data,
            openHouseId,
            organizationId,
        );

        return await this.repository.createLead(lead);
    }

    async getOpenHouseLeads(openHouseId: string): Promise<OpenHouseLead[]> {
        return await this.repository.findLeadsByOpenHouseId(openHouseId);
    }

    async getOpenHouseLeadsOrg(
        openHouseId: string,
        organizationId: string,
    ): Promise<OpenHouseLead[]> {
        return await this.repository.findLeadsByOpenHouseIdAndOrg(
            openHouseId,
            organizationId,
        );
    }
}
