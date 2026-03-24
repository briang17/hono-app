import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, memberAc } from "better-auth/plugins/organization/access";

const statement = {
    ...defaultStatements,
    openhouse: ["create", "view", "delete"],
    lead: ["view", "export"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
    ...adminAc.statements,
    openhouse: ["create", "view", "delete"],
    lead: ["view", "export"],
});

export const admin = ac.newRole({
    ...adminAc.statements,
    openhouse: ["create", "view", "delete"],
    lead: ["view", "export"],
});

export const agent = ac.newRole({
    ...memberAc.statements,
    openhouse: ["create", "view"],
    lead: ["view"],
});
