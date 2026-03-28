import { db } from "@packages/database";
import { organizationFormConfig } from "@packages/database/src/schemas/form-config.schema";
import { eq } from "drizzle-orm";
import { FormConfigFactory, } from "../domain/form-config.entity";
export class DbFormConfigRepository {
    async getByOrg(organizationId) {
        const [result] = await db
            .select()
            .from(organizationFormConfig)
            .where(eq(organizationFormConfig.organizationId, organizationId))
            .limit(1);
        if (!result)
            return null;
        return FormConfigFactory.fromDb({
            ...result,
            questions: result.questions,
        });
    }
    async create(config) {
        const [result] = await db
            .insert(organizationFormConfig)
            .values(config)
            .returning();
        if (!result)
            throw new Error();
        return FormConfigFactory.fromDb({
            ...result,
            questions: result.questions,
        });
    }
    async update(id, questions) {
        const [result] = await db
            .update(organizationFormConfig)
            .set({ questions, updatedAt: new Date() })
            .where(eq(organizationFormConfig.id, id))
            .returning();
        if (!result)
            return null;
        return FormConfigFactory.fromDb({
            ...result,
            questions: result.questions,
        });
    }
    async delete(id) {
        await db
            .delete(organizationFormConfig)
            .where(eq(organizationFormConfig.id, id));
    }
}
