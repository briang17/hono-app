import type {
	CreateOpenHouseInput,
	CreateOpenHouseLeadInput,
} from "../api/openhouse.schemas";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import type { OpenHouse, OpenHouseLead } from "../domain/openhouse.entity";

export class OpenHouseService {
	constructor(private repository: IOpenHouseRepository) {}

	async createOpenHouse(
		data: CreateOpenHouseInput,
		organizationId: string,
		userId: string,
	): Promise<OpenHouse> {
		return this.repository.create({
			propertyAddress: data.propertyAddress,
			listingPrice: data.listingPrice,
			date: data.date,
			startTime: data.startTime,
			endTime: data.endTime,
			listingImageUrl: data.listingImageUrl || null,
			notes: data.notes || null,
			organizationId,
			createdByUserId: userId,
		});
	}

	async getOpenHouses(
		organizationId: string,
		userId: string,
	): Promise<OpenHouse[]> {
		return this.repository.findByOrgAndUser(organizationId, userId);
	}

	async getOpenHouse(id: string): Promise<OpenHouse | null> {
		return this.repository.findById(id);
	}

	async getPublicOpenHouse(id: string): Promise<OpenHouse | null> {
		return this.repository.findPublicById(id);
	}

	async createOpenHouseLead(
		openHouseId: string,
		data: CreateOpenHouseLeadInput,
		organizationId: string,
	): Promise<OpenHouseLead> {
		return this.repository.createLead({
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email || null,
			phone: data.phone || null,
			workingWithAgent: data.workingWithAgent,
			openHouseId,
			organizationId,
		});
	}

	async getOpenHouseLeads(openHouseId: string): Promise<OpenHouseLead[]> {
		return this.repository.findLeadsByOpenHouseId(openHouseId);
	}

	async getOpenHouseLeadsOrg(
		openHouseId: string,
		organizationId: string,
	): Promise<OpenHouseLead[]> {
		return this.repository.findLeadsByOpenHouseIdAndOrg(
			openHouseId,
			organizationId,
		);
	}
}
