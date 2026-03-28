import type { Id } from "@features/common/values";
import type { OpenHouse, OpenHouseLead, PublicOpenHouse } from "./openhouse.entity";
export interface IOpenHouseRepository {
    create(params: OpenHouse): Promise<OpenHouse>;
    findById(id: Id): Promise<OpenHouse | null>;
    findByOrgAndUser(organizationId: Id, userId: Id): Promise<OpenHouse[]>;
    findPublicById(id: Id): Promise<OpenHouse | null>;
    findPublicByIdWithFormConfig(id: Id): Promise<PublicOpenHouse | null>;
    createLead(params: OpenHouseLead): Promise<OpenHouseLead>;
    findLeadsByOpenHouseId(openHouseId: Id): Promise<OpenHouseLead[]>;
    findLeadsByOpenHouseIdAndOrg(openHouseId: Id, organizationId: Id): Promise<OpenHouseLead[]>;
}
