import { codes } from "@config/constants";
import { deleteCloudinaryImages } from "@features/cloudinary/cloudinary.utils";
import { HTTPException } from "hono/http-exception";
import { OpenHouseFactory, OpenHouseLeadFactory, validateResponses, } from "../domain/openhouse.entity";
export class OpenHouseService {
    repository;
    formConfigRepository;
    constructor(repository, formConfigRepository) {
        this.repository = repository;
        this.formConfigRepository = formConfigRepository;
    }
    async createOpenHouse(data, organizationId, userId) {
        const { openHouse, images } = OpenHouseFactory.create(data, organizationId, userId);
        const created = await this.repository.create(openHouse);
        const createdImages = await this.repository.createImages(created.id, images);
        return { ...created, images: createdImages };
    }
    async getOpenHouses(organizationId, userId) {
        return await this.repository.findByOrgAndUser(organizationId, userId);
    }
    async getOpenHouse(id) {
        return await this.repository.findById(id);
    }
    async getPublicOpenHouse(id) {
        return await this.repository.findPublicById(id);
    }
    async getPublicOpenHouseWithFormConfig(id) {
        return await this.repository.findPublicByIdWithFormConfig(id);
    }
    async deleteOpenHouse(id, organizationId) {
        const openHouse = await this.repository.findById(id);
        if (!openHouse || openHouse.organizationId !== organizationId) {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Open house not found",
            });
        }
        const publicIds = await this.repository.findImagePublicIdsByOpenHouseId(id);
        await this.repository.delete(id);
        await deleteCloudinaryImages(publicIds);
    }
    async createOpenHouseLead(openHouseId, data, organizationId) {
        const formConfig = await this.formConfigRepository.getByOrg(organizationId);
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
                cause: validation.errors,
            });
        }
        const lead = OpenHouseLeadFactory.create(data, openHouseId, organizationId);
        return await this.repository.createLead(lead);
    }
    async getOpenHouseLeads(openHouseId) {
        return await this.repository.findLeadsByOpenHouseId(openHouseId);
    }
    async getOpenHouseLeadsOrg(openHouseId, organizationId) {
        return await this.repository.findLeadsByOpenHouseIdAndOrg(openHouseId, organizationId);
    }
    async getOpenHouseLeadsWithFormConfig(openHouseId, organizationId) {
        const [leads, formConfig] = await Promise.all([
            this.repository.findLeadsByOpenHouseIdAndOrg(openHouseId, organizationId),
            this.formConfigRepository.getByOrg(organizationId),
        ]);
        return { leads, formConfig };
    }
}
