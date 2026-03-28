import type { Id } from "@features/common/values";
import { type FormConfig } from "../domain/form-config.entity";
import type { IFormConfigRepository } from "../domain/interface.form-config.repository";
export declare class FormConfigService {
    private repository;
    constructor(repository: IFormConfigRepository);
    getFormConfig(organizationId: Id): Promise<FormConfig | null>;
    createFormConfig(organizationId: Id, questions: FormConfig["questions"]): Promise<FormConfig>;
    updateFormConfig(id: Id, questions: FormConfig["questions"]): Promise<FormConfig | null>;
    deleteFormConfig(id: Id): Promise<void>;
}
