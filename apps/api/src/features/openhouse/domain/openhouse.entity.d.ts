import { type Id } from "@features/common/values";
import type { FormConfig } from "@formconfig/domain/form-config.entity";
import { z } from "zod";
export declare const OpenHouseImageSchema: z.ZodObject<
    {
        id: z.ZodUUID;
        openHouseId: z.ZodUUID;
        url: z.ZodURL;
        publicId: z.ZodString;
        isMain: z.ZodBoolean;
        orderIndex: z.ZodNumber;
        createdAt: z.ZodCoercedDate<unknown>;
    },
    z.core.$strip
>;
export declare const NewOpenHouseImageSchema: z.ZodObject<
    {
        url: z.ZodURL;
        publicId: z.ZodString;
        isMain: z.ZodDefault<z.ZodBoolean>;
        orderIndex: z.ZodDefault<z.ZodNumber>;
    },
    z.core.$strip
>;
export type OpenHouseImage = z.infer<typeof OpenHouseImageSchema>;
export type NewOpenHouseImageInput = z.infer<typeof NewOpenHouseImageSchema>;
export declare const OpenHouseSchema: z.ZodObject<
    {
        id: z.ZodUUID;
        organizationId: z.ZodUUID;
        createdByUserId: z.ZodUUID;
        propertyAddress: z.ZodString;
        listingPrice: z.ZodNumber;
        date: z.ZodCoercedDate<unknown>;
        startTime: z.ZodString;
        endTime: z.ZodString;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        images: z.ZodDefault<
            z.ZodArray<
                z.ZodObject<
                    {
                        id: z.ZodUUID;
                        openHouseId: z.ZodUUID;
                        url: z.ZodURL;
                        publicId: z.ZodString;
                        isMain: z.ZodBoolean;
                        orderIndex: z.ZodNumber;
                        createdAt: z.ZodCoercedDate<unknown>;
                    },
                    z.core.$strip
                >
            >
        >;
        createdAt: z.ZodCoercedDate<unknown>;
        updatedAt: z.ZodCoercedDate<unknown>;
    },
    z.core.$strip
>;
export declare const NewOpenHouseSchema: z.ZodObject<
    {
        date: z.ZodCoercedDate<unknown>;
        propertyAddress: z.ZodString;
        listingPrice: z.ZodNumber;
        startTime: z.ZodString;
        endTime: z.ZodString;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        images: z.ZodDefault<
            z.ZodArray<
                z.ZodObject<
                    {
                        url: z.ZodURL;
                        publicId: z.ZodString;
                        isMain: z.ZodDefault<z.ZodBoolean>;
                        orderIndex: z.ZodDefault<z.ZodNumber>;
                    },
                    z.core.$strip
                >
            >
        >;
    },
    z.core.$strip
>;
export declare const OpenHouseLeadSchema: z.ZodObject<
    {
        id: z.ZodUUID;
        openHouseId: z.ZodUUID;
        organizationId: z.ZodUUID;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodUnion<
            readonly [
                z.ZodOptional<z.ZodNullable<z.ZodEmail>>,
                z.ZodLiteral<"">,
            ]
        >;
        phone: z.ZodUnion<
            readonly [
                z.ZodOptional<z.ZodNullable<z.ZodString>>,
                z.ZodLiteral<"">,
            ]
        >;
        workingWithAgent: z.ZodDefault<z.ZodBoolean>;
        submittedAt: z.ZodCoercedDate<unknown>;
        consent: z.ZodDefault<z.ZodBoolean>;
        responses: z.ZodOptional<
            z.ZodNullable<
                z.ZodNullable<
                    z.ZodRecord<
                        z.ZodString,
                        z.ZodUnion<
                            readonly [
                                z.ZodString,
                                z.ZodNumber,
                                z.ZodArray<z.ZodString>,
                                z.ZodArray<z.ZodNumber>,
                            ]
                        >
                    >
                >
            >
        >;
    },
    z.core.$strip
>;
export declare const NewOpenHouseLeadSchema: z.ZodObject<
    {
        email: z.ZodUnion<
            readonly [
                z.ZodOptional<z.ZodNullable<z.ZodEmail>>,
                z.ZodLiteral<"">,
            ]
        >;
        firstName: z.ZodString;
        lastName: z.ZodString;
        phone: z.ZodUnion<
            readonly [
                z.ZodOptional<z.ZodNullable<z.ZodString>>,
                z.ZodLiteral<"">,
            ]
        >;
        workingWithAgent: z.ZodDefault<z.ZodBoolean>;
        consent: z.ZodDefault<z.ZodBoolean>;
        responses: z.ZodOptional<
            z.ZodNullable<
                z.ZodNullable<
                    z.ZodRecord<
                        z.ZodString,
                        z.ZodUnion<
                            readonly [
                                z.ZodString,
                                z.ZodNumber,
                                z.ZodArray<z.ZodString>,
                                z.ZodArray<z.ZodNumber>,
                            ]
                        >
                    >
                >
            >
        >;
    },
    z.core.$strip
>;
export type OpenHouse = z.infer<typeof OpenHouseSchema>;
export type OpenHouseLead = z.infer<typeof OpenHouseLeadSchema>;
export type NewOpenHouseLeadInput = z.infer<typeof NewOpenHouseLeadSchema>;
export declare const PublicOpenHouseSchema: z.ZodObject<
    {
        id: z.ZodUUID;
        propertyAddress: z.ZodString;
        date: z.ZodCoercedDate<unknown>;
        startTime: z.ZodString;
        endTime: z.ZodString;
        formConfig: z.ZodNullable<
            z.ZodObject<
                {
                    id: z.ZodUUID;
                    organizationId: z.ZodUUID;
                    questions: z.ZodArray<
                        z.ZodObject<
                            {
                                id: z.ZodUUID;
                                type: z.ZodEnum<{
                                    number: "number";
                                    text: "text";
                                    date: "date";
                                    select: "select";
                                    textarea: "textarea";
                                    checkbox: "checkbox";
                                    radio: "radio";
                                    range: "range";
                                }>;
                                label: z.ZodString;
                                placeholder: z.ZodOptional<z.ZodString>;
                                required: z.ZodBoolean;
                                options: z.ZodOptional<
                                    z.ZodArray<
                                        z.ZodObject<
                                            {
                                                label: z.ZodString;
                                                value: z.ZodString;
                                            },
                                            z.core.$strip
                                        >
                                    >
                                >;
                                validation: z.ZodOptional<
                                    z.ZodObject<
                                        {
                                            minLength: z.ZodOptional<z.ZodNumber>;
                                            maxLength: z.ZodOptional<z.ZodNumber>;
                                            min: z.ZodOptional<z.ZodNumber>;
                                            max: z.ZodOptional<z.ZodNumber>;
                                        },
                                        z.core.$strip
                                    >
                                >;
                                step: z.ZodOptional<z.ZodNumber>;
                            },
                            z.core.$strip
                        >
                    >;
                    createdAt: z.ZodCoercedDate<unknown>;
                    updatedAt: z.ZodCoercedDate<unknown>;
                },
                z.core.$strip
            >
        >;
        images: z.ZodDefault<
            z.ZodArray<
                z.ZodObject<
                    {
                        id: z.ZodUUID;
                        openHouseId: z.ZodUUID;
                        url: z.ZodURL;
                        publicId: z.ZodString;
                        isMain: z.ZodBoolean;
                        orderIndex: z.ZodNumber;
                        createdAt: z.ZodCoercedDate<unknown>;
                    },
                    z.core.$strip
                >
            >
        >;
    },
    z.core.$strip
>;
export type PublicOpenHouse = z.infer<typeof PublicOpenHouseSchema>;
export declare const OpenHouseFactory: {
    create: (
        params: z.input<typeof NewOpenHouseSchema>,
        organizationId: Id,
        userId: Id,
    ) => {
        openHouse: Omit<OpenHouse, "images">;
        images: NewOpenHouseImageInput[];
    };
    fromDb: (params: z.input<typeof OpenHouseSchema>) => OpenHouse;
};
export declare const OpenHouseLeadFactory: {
    create: (
        params: z.input<typeof NewOpenHouseLeadSchema>,
        openHouseId: Id,
        organizationId: Id,
    ) => OpenHouseLead;
    fromDb: (params: z.input<typeof OpenHouseLeadSchema>) => OpenHouseLead;
};
export declare const ResponseValidationErrorSchema: z.ZodObject<
    {
        questionId: z.ZodUUID;
        message: z.ZodString;
        code: z.ZodEnum<{
            invalid_type: "invalid_type";
            required: "required";
            invalid_option: "invalid_option";
            invalid_length: "invalid_length";
            invalid_range: "invalid_range";
        }>;
    },
    z.core.$strip
>;
export type ResponseValidationError = z.infer<
    typeof ResponseValidationErrorSchema
>;
export declare const ResponseValidationResultSchema: z.ZodObject<
    {
        isValid: z.ZodBoolean;
        errors: z.ZodArray<
            z.ZodObject<
                {
                    questionId: z.ZodUUID;
                    message: z.ZodString;
                    code: z.ZodEnum<{
                        invalid_type: "invalid_type";
                        required: "required";
                        invalid_option: "invalid_option";
                        invalid_length: "invalid_length";
                        invalid_range: "invalid_range";
                    }>;
                },
                z.core.$strip
            >
        >;
    },
    z.core.$strip
>;
export type ResponseValidationResult = z.infer<
    typeof ResponseValidationResultSchema
>;
export interface ResponseValidationInput {
    responses:
        | Record<string, string | number | string[] | number[]>
        | null
        | undefined;
    formConfig: FormConfig | null;
}
export declare function validateResponses({
    responses,
    formConfig,
}: ResponseValidationInput): ResponseValidationResult;
