import { codes } from "@config/constants";
import type { IFormConfigRepository } from "@formconfig/domain/interface.form-config.repository";
import { HTTPException } from "hono/http-exception";
import type { CreateOpenHouseInput } from "../api/openhouse.schemas";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import type { NewOpenHouseLeadInput } from "../domain/openhouse.entity";
import {
    type OpenHouse,
    OpenHouseFactory,
    type OpenHouseLead,
    OpenHouseLeadFactory,
    validateResponses,
} from "../domain/openhouse.entity";

export class OpenHouseService {
    constructor(
        private repository: IOpenHouseRepository,
        private formConfigRepository: IFormConfigRepository,
    ) {}

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

    async getPublicOpenHouseWithFormConfig(
        id: string,
    ): Promise<OpenHouse | null> {
        return await this.repository.findPublicByIdWithFormConfig(id);
    }

    async createOpenHouseLead(
        openHouseId: string,
        data: NewOpenHouseLeadInput,
        organizationId: string,
    ): Promise<OpenHouseLead> {
        const formConfig =
            await this.formConfigRepository.getByOrg(organizationId);

        const validation = validateResponses({
            responses: data.responses,
            formConfig,
        });

        if (!validation.isValid) {
            const _errorMessages = validation.errors
                .map((e) => `${e.questionId}: ${e.message}`)
                .join("; ");

            throw new HTTPException(codes.BAD_REQUEST, {
                message: "Invalid responses",
                details: validation.errors,
            });
        }

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
