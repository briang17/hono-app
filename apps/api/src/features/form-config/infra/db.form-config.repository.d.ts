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
                | "text"
                | "date"
                | "select"
                | "textarea"
                | "checkbox"
                | "radio"
                | "range";
            label: string;
            required: boolean;
            placeholder?: string | undefined;
            options?:
                | {
                      label: string;
                      value: string;
                  }[]
                | undefined;
            validation?:
                | {
                      minLength?: number | undefined;
                      maxLength?: number | undefined;
                      min?: number | undefined;
                      max?: number | undefined;
                  }
                | undefined;
            step?: number | undefined;
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
                | "text"
                | "date"
                | "select"
                | "textarea"
                | "checkbox"
                | "radio"
                | "range";
            label: string;
            required: boolean;
            placeholder?: string | undefined;
            options?:
                | {
                      label: string;
                      value: string;
                  }[]
                | undefined;
            validation?:
                | {
                      minLength?: number | undefined;
                      maxLength?: number | undefined;
                      min?: number | undefined;
                      max?: number | undefined;
                  }
                | undefined;
            step?: number | undefined;
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
                | "text"
                | "date"
                | "select"
                | "textarea"
                | "checkbox"
                | "radio"
                | "range";
            label: string;
            required: boolean;
            placeholder?: string | undefined;
            options?:
                | {
                      label: string;
                      value: string;
                  }[]
                | undefined;
            validation?:
                | {
                      minLength?: number | undefined;
                      maxLength?: number | undefined;
                      min?: number | undefined;
                      max?: number | undefined;
                  }
                | undefined;
            step?: number | undefined;
        }[];
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    delete(id: Id): Promise<void>;
}
