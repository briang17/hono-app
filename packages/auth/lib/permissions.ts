import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, memberAc } from "better-auth/plugins/organization/access";

const statement = {
    ...defaultStatements,
    openhouse: ["create", "view", "delete", "update"],
    lead: ["view", "export"],
    agent: ["create", "view", "update", "delete", "deactivate"],
    form_config: ["create", "view", "update", "delete"],
} as const;

type ExtractValuesMap<T> = {
  -readonly [K in keyof T]?: T[K] extends readonly (infer U)[] ? U[] : never;
};

export type RBACParams = ExtractValuesMap<typeof statement>;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
    ...adminAc.statements,
    openhouse: ["create", "view", "update", "delete"],
    lead: ["view", "export"],
    agent: ["create", "view", "update", "delete", "deactivate"],
    form_config: ["create", "view", "update", "delete"],
});

export const admin = ac.newRole({
    ...adminAc.statements,
    openhouse: ["create", "view", "update", "delete"],
    lead: ["view", "export"],
    agent: ["create", "view", "update", "delete", "deactivate"],
    form_config: ["create", "view", "update", "delete"],
});

export const agent = ac.newRole({
    ...memberAc.statements,
    openhouse: ["create", "view"],
    lead: ["view"],
    form_config: ["view"],
});
