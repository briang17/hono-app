import type { Id } from "@features/common/values";
import {
    type FormConfig,
    FormConfigFactory,
} from "../domain/form-config.entity";
import type { IFormConfigRepository } from "../domain/interface.form-config.repository";

export class FormConfigService {
    constructor(private repository: IFormConfigRepository) {}

    async getFormConfig(organizationId: Id): Promise<FormConfig | null> {
        return await this.repository.getByOrg(organizationId);
    }

    async createFormConfig(
        organizationId: Id,
        questions: FormConfig["questions"],
    ): Promise<FormConfig> {
        const config = FormConfigFactory.create({ questions }, organizationId);

        return await this.repository.create(config);
    }

    async updateFormConfig(
        id: Id,
        questions: FormConfig["questions"],
    ): Promise<FormConfig | null> {
        return await this.repository.update(id, questions);
    }

    async deleteFormConfig(id: Id): Promise<void> {
        await this.repository.delete(id);
    }
}
