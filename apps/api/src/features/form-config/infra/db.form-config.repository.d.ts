import type { Id } from "@features/common/values";
import { type FormConfig } from "../domain/form-config.entity";
import type { IFormConfigRepository } from "../domain/interface.form-config.repository";
export declare class DbFormConfigRepository implements IFormConfigRepository {
    getByOrg(organizationId: Id): Promise<{
        id: string;
        organizationId: string;
        questions: {
            id: string;
            type:
                | "number"
                | "short_text"
                | "long_text"
                | "multiple_choice"
                | "checkboxes";
            label: string;
            required: boolean;
            order: number;
            placeholder?: string | undefined;
            options?: string[] | undefined;
            validation?:
                | {
                      minLength?: number | undefined;
                      maxLength?: number | undefined;
                      min?: number | undefined;
                      max?: number | undefined;
                  }
                | undefined;
        }[];
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(config: FormConfig): Promise<{
        id: string;
        organizationId: string;
        questions: {
            id: string;
            type:
                | "number"
                | "short_text"
                | "long_text"
                | "multiple_choice"
                | "checkboxes";
            label: string;
            required: boolean;
            order: number;
            placeholder?: string | undefined;
            options?: string[] | undefined;
            validation?:
                | {
                      minLength?: number | undefined;
                      maxLength?: number | undefined;
                      min?: number | undefined;
                      max?: number | undefined;
                  }
                | undefined;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(
        id: Id,
        questions: FormConfig["questions"],
    ): Promise<{
        id: string;
        organizationId: string;
        questions: {
            id: string;
            type:
                | "number"
                | "short_text"
                | "long_text"
                | "multiple_choice"
                | "checkboxes";
            label: string;
            required: boolean;
            order: number;
            placeholder?: string | undefined;
            options?: string[] | undefined;
            validation?:
                | {
                      minLength?: number | undefined;
                      maxLength?: number | undefined;
                      min?: number | undefined;
                      max?: number | undefined;
                  }
                | undefined;
        }[];
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    delete(id: Id): Promise<void>;
}
