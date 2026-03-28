import { FormConfigFactory, } from "../domain/form-config.entity";
export class FormConfigService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async getFormConfig(organizationId) {
        return await this.repository.getByOrg(organizationId);
    }
    async createFormConfig(organizationId, questions) {
        const config = FormConfigFactory.create({ questions }, organizationId);
        return await this.repository.create(config);
    }
    async updateFormConfig(id, questions) {
        return await this.repository.update(id, questions);
    }
    async deleteFormConfig(id) {
        await this.repository.delete(id);
    }
}
