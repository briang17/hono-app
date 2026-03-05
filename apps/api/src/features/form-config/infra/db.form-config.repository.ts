import type { Id } from "@features/common/values";
import { db } from "@packages/database";
import { organizationFormConfig } from "@packages/database/src/schemas/form-config.schema";
import { eq } from "drizzle-orm";
import {
    type FormConfig,
    FormConfigFactory,
} from "../domain/form-config.entity";
import type { IFormConfigRepository } from "../domain/interface.form-config.repository";

export class DbFormConfigRepository implements IFormConfigRepository {
    async getByOrg(organizationId: Id) {
        const [result] = await db
            .select()
            .from(organizationFormConfig)
            .where(eq(organizationFormConfig.organizationId, organizationId))
            .limit(1);

        if (!result) return null;

        return FormConfigFactory.fromDb({
            ...result,
            questions: result.questions as FormConfig["questions"],
        });
    }

    async create(config: FormConfig) {
        const [result] = await db
            .insert(organizationFormConfig)
            .values(config)
            .returning();

        if (!result) throw new Error();

        return FormConfigFactory.fromDb({
            ...result,
            questions: result.questions as FormConfig["questions"],
        });
    }

    async update(id: Id, questions: FormConfig["questions"]) {
        const [result] = await db
            .update(organizationFormConfig)
            .set({ questions, updatedAt: new Date() })
            .where(eq(organizationFormConfig.id, id))
            .returning();

        if (!result) return null;

        return FormConfigFactory.fromDb({
            ...result,
            questions: result.questions as FormConfig["questions"],
        });
    }

    async delete(id: Id) {
        await db
            .delete(organizationFormConfig)
            .where(eq(organizationFormConfig.id, id));
    }
}
