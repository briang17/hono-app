import type { OpenHouse, OpenHouseLead } from "./openhouse.entity";

export interface IOpenHouseRepository {
	create(params: {
		organizationId: string;
		createdByUserId: string;
		propertyAddress: string;
		listingPrice: number;
		date: Date;
		startTime: string;
		endTime: string;
		listingImageUrl: string | null;
		notes: string | null;
	}): Promise<OpenHouse>;

	findById(id: string): Promise<OpenHouse | null>;

	findByOrgAndUser(
		organizationId: string,
		userId: string,
	): Promise<OpenHouse[]>;

	findPublicById(id: string): Promise<OpenHouse | null>;

	createLead(params: {
		openHouseId: string;
		organizationId: string;
		firstName: string;
		lastName: string;
		email: string | null;
		phone: string | null;
		workingWithAgent: boolean;
	}): Promise<OpenHouseLead>;

	findLeadsByOpenHouseId(openHouseId: string): Promise<OpenHouseLead[]>;

	findLeadsByOpenHouseIdAndOrg(
		openHouseId: string,
		organizationId: string,
	): Promise<OpenHouseLead[]>;
}
