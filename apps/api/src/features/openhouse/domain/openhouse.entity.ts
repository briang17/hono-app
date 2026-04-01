import {
    DateSchema,
    EmailSchema,
    type Id,
    IdSchema,
    PhoneSchema,
} from "@features/common/values";
import type {
    FormConfig,
    Question,
} from "@formconfig/domain/form-config.entity";
import { FormConfigSchema } from "@formconfig/domain/form-config.entity";
import { z } from "zod";

export const OpenHouseSchema = z.object({
    id: IdSchema,
    organizationId: IdSchema,
    createdByUserId: IdSchema,
    propertyAddress: z.string().min(1, "Address is required"),
    listingPrice: z.number().positive("Price must be positive"),
    date: DateSchema,
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    listingImageUrl: z.union([z.url().nullish(), z.literal("")]),
    notes: z.string().nullish(),
    createdAt: DateSchema,
    updatedAt: DateSchema,
});

export const NewOpenHouseSchema = OpenHouseSchema.pick({
    propertyAddress: true,
    listingPrice: true,
    date: true,
    startTime: true,
    endTime: true,
    listingImageUrl: true,
    notes: true,
}).refine((data) => data.startTime < data.endTime, {
    error: "End time must be after start time",
    path: ["endTime"],
});

export const OpenHouseLeadSchema = z.object({
    id: IdSchema,
    openHouseId: IdSchema,
    organizationId: IdSchema,
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.union([EmailSchema.nullish(), z.literal("")]),
    phone: z.union([PhoneSchema.nullish(), z.literal("")]),
    workingWithAgent: z.boolean().default(false),
    submittedAt: DateSchema,
    consent: z.boolean().default(false),
    responses: z
        .record(
            z.string(),
            z.union([
                z.string(),
                z.number(),
                z.array(z.string()),
                z.array(z.number()),
            ]),
        )
        .nullable()
        .nullish(),
});

export const NewOpenHouseLeadSchema = OpenHouseLeadSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    workingWithAgent: true,
    consent: true,
    responses: true,
}).refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
});

export type OpenHouse = z.infer<typeof OpenHouseSchema>;
export type OpenHouseLead = z.infer<typeof OpenHouseLeadSchema>;
export type NewOpenHouseLeadInput = z.infer<typeof NewOpenHouseLeadSchema>;

export const PublicOpenHouseSchema = z.object({
    id: IdSchema,
    propertyAddress: z.string().min(1),
    date: DateSchema,
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    formConfig: FormConfigSchema.nullable(),
    listingImageUrl: z.union([z.url().nullish(), z.literal("")]),
});

export type PublicOpenHouse = z.infer<typeof PublicOpenHouseSchema>;

export const OpenHouseFactory = {
    create: (
        params: z.input<typeof NewOpenHouseSchema>,
        organizationId: Id,
        userId: Id,
    ): OpenHouse => {
        const now = new Date();
        const result = OpenHouseSchema.parse({
            ...params,
            id: Bun.randomUUIDv7(),
            organizationId,
            createdByUserId: userId,
            createdAt: now,
            updatedAt: now,
        });
        return result;
    },
    fromDb: (params: z.input<typeof OpenHouseSchema>): OpenHouse => {
        const result = OpenHouseSchema.parse(params);
        return result;
    },
};

export const OpenHouseLeadFactory = {
    create: (
        params: z.input<typeof NewOpenHouseLeadSchema>,
        openHouseId: Id,
        organizationId: Id,
    ): OpenHouseLead => {
        const now = new Date();
        return OpenHouseLeadSchema.parse({
            ...params,
            id: Bun.randomUUIDv7(),
            openHouseId,
            organizationId,
            submittedAt: now,
        });
    },
    fromDb: (params: z.input<typeof OpenHouseLeadSchema>): OpenHouseLead => {
        const result = OpenHouseLeadSchema.parse(params);
        return result;
    },
};

export const ResponseValidationErrorSchema = z.object({
    questionId: IdSchema,
    message: z.string(),
    code: z.enum([
        "required",
        "invalid_type",
        "invalid_option",
        "invalid_length",
        "invalid_range",
    ]),
});

export type ResponseValidationError = z.infer<
    typeof ResponseValidationErrorSchema
>;

export const ResponseValidationResultSchema = z.object({
    isValid: z.boolean(),
    errors: z.array(ResponseValidationErrorSchema),
});

export type ResponseValidationResult = z.infer<
    typeof ResponseValidationResultSchema
>;

export interface ResponseValidationInput {
    responses: Record<string, string | number | string[] | number[]> | null | undefined;
    formConfig: FormConfig | null;
}

const optionValues = (options: { value: string }[] | undefined): string[] =>
    options?.map((o) => o.value) ?? [];

function validateRangeResponse(
    response: unknown,
    question: Question,
    questionId: string,
    errors: ResponseValidationError[],
): boolean {
    if (
        !Array.isArray(response) ||
        response.length !== 2 ||
        typeof response[0] !== "number" ||
        typeof response[1] !== "number"
    ) {
        errors.push({
            questionId,
            message: `"${question.label}" must be a range of two numbers`,
            code: "invalid_type",
        });
        return false;
    }

    const [lo, hi] = response as [number, number];

    if (lo > hi) {
        errors.push({
            questionId,
            message: `"${question.label}" lower bound must not exceed upper bound`,
            code: "invalid_range",
        });
    }

    if (
        question.validation?.min !== undefined &&
        lo < question.validation.min
    ) {
        errors.push({
            questionId,
            message: `"${question.label}" lower bound must be at least ${question.validation.min}`,
            code: "invalid_range",
        });
    }

    if (
        question.validation?.max !== undefined &&
        hi > question.validation.max
    ) {
        errors.push({
            questionId,
            message: `"${question.label}" upper bound must be at most ${question.validation.max}`,
            code: "invalid_range",
        });
    }

    return true;
}

export function validateResponses({
    responses,
    formConfig,
}: ResponseValidationInput): ResponseValidationResult {
    if (!formConfig) {
        return { isValid: true, errors: [] };
    }

    if (!responses || Object.keys(responses).length === 0) {
        return { isValid: true, errors: [] };
    }

    const errors: ResponseValidationResult["errors"] = [];
    const questionsByQuestionId = new Map(
        formConfig.questions.map((q) => [q.id, q]),
    );

    for (const [questionId, response] of Object.entries(responses)) {
        const question = questionsByQuestionId.get(questionId);

        if (!question) {
            errors.push({
                questionId,
                message: `Invalid question ID: ${questionId}`,
                code: "invalid_option",
            });
            continue;
        }

        if (
            question.required &&
            (response === null || response === undefined || response === "")
        ) {
            errors.push({
                questionId,
                message: `"${question.label}" is required`,
                code: "required",
            });
            continue;
        }

        if (
            !question.required &&
            (response === null || response === undefined || response === "")
        ) {
            continue;
        }

        if (question.type === "number") {
            if (
                typeof response !== "number" &&
                Number.isNaN(Number(response))
            ) {
                errors.push({
                    questionId,
                    message: `"${question.label}" must be a number`,
                    code: "invalid_type",
                });
                continue;
            }

            const numValue = Number(response);

            if (
                question.validation?.min !== undefined &&
                numValue < question.validation.min
            ) {
                errors.push({
                    questionId,
                    message: `"${question.label}" must be at least ${question.validation.min}`,
                    code: "invalid_range",
                });
            }

            if (
                question.validation?.max !== undefined &&
                numValue > question.validation.max
            ) {
                errors.push({
                    questionId,
                    message: `"${question.label}" must be at most ${question.validation.max}`,
                    code: "invalid_range",
                });
            }
        }

        if (question.type === "range") {
            validateRangeResponse(response, question, questionId, errors);
        }

        if (question.type === "text" || question.type === "textarea") {
            const stringValue = String(response);

            if (
                question.validation?.minLength !== undefined &&
                stringValue.length < question.validation.minLength
            ) {
                errors.push({
                    questionId,
                    message: `"${question.label}" must be at least ${question.validation.minLength} characters`,
                    code: "invalid_length",
                });
            }

            if (
                question.validation?.maxLength !== undefined &&
                stringValue.length > question.validation.maxLength
            ) {
                errors.push({
                    questionId,
                    message: `"${question.label}" must be at most ${question.validation.maxLength} characters`,
                    code: "invalid_length",
                });
            }
        }

        if (question.type === "select" || question.type === "radio") {
            if (typeof response !== "string") {
                errors.push({
                    questionId,
                    message: `"${question.label}" must be a single option`,
                    code: "invalid_type",
                });
                continue;
            }

            if (!optionValues(question.options).includes(response)) {
                errors.push({
                    questionId,
                    message: `"${question.label}" must be one of the provided options`,
                    code: "invalid_option",
                });
            }
        }

        if (question.type === "checkbox") {
            if (!Array.isArray(response)) {
                errors.push({
                    questionId,
                    message: `"${question.label}" must be an array of options`,
                    code: "invalid_type",
                });
                continue;
            }

            const validValues = optionValues(question.options);
            for (const option of response) {
                if (!validValues.includes(option as string)) {
                    errors.push({
                        questionId,
                        message: `"${question.label}" contains invalid option: ${option}`,
                        code: "invalid_option",
                    });
                }
            }
        }

        if (question.type === "date") {
            if (typeof response !== "string") {
                errors.push({
                    questionId,
                    message: `"${question.label}" must be a date string`,
                    code: "invalid_type",
                });
                continue;
            }

            const parsed = Date.parse(response);
            if (Number.isNaN(parsed)) {
                errors.push({
                    questionId,
                    message: `"${question.label}" must be a valid date`,
                    code: "invalid_type",
                });
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
