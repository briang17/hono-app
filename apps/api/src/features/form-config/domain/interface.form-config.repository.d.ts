import type { Id } from "@features/common/values";
import type { FormConfig } from "./form-config.entity";
export interface IFormConfigRepository {
    getByOrg(organizationId: Id): Promise<FormConfig | null>;
    create(config: FormConfig): Promise<FormConfig>;
    update(id: Id, questions: FormConfig["questions"]): Promise<FormConfig | null>;
    delete(id: Id): Promise<void>;
}
