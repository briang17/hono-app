import type { Id } from "@features/common/values";
import type {
    NewOpenHouseImageInput,
    OpenHouse,
    OpenHouseImage,
    OpenHouseLead,
    PublicOpenHouse,
} from "./openhouse.entity";

export interface IOpenHouseRepository {
    create(params: Omit<OpenHouse, "images">): Promise<OpenHouse>;

    findById(id: Id): Promise<OpenHouse | null>;

    findByOrgAndUser(organizationId: Id, userId: Id): Promise<OpenHouse[]>;

    findPublicById(id: Id): Promise<OpenHouse | null>;

    findPublicByIdWithFormConfig(id: Id): Promise<PublicOpenHouse | null>;

    createImages(
        openHouseId: Id,
        images: NewOpenHouseImageInput[],
    ): Promise<OpenHouseImage[]>;

    findImagesByOpenHouseId(openHouseId: Id): Promise<OpenHouseImage[]>;

    findImagePublicIdsByOpenHouseId(openHouseId: Id): Promise<string[]>;

    delete(openHouseId: Id): Promise<void>;

    createLead(params: OpenHouseLead): Promise<OpenHouseLead>;

    findLeadsByOpenHouseId(openHouseId: Id): Promise<OpenHouseLead[]>;

    findLeadsByOpenHouseIdAndOrg(
        openHouseId: Id,
        organizationId: Id,
    ): Promise<OpenHouseLead[]>;
}
