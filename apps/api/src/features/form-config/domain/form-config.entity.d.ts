import { type Id } from "@features/common/values";
import { z } from "zod";
export declare const QuestionTypeSchema: z.ZodEnum<{
    number: "number";
    short_text: "short_text";
    long_text: "long_text";
    multiple_choice: "multiple_choice";
    checkboxes: "checkboxes";
}>;
export declare const QuestionValidationSchema: z.ZodObject<
    {
        minLength: z.ZodOptional<z.ZodNumber>;
        maxLength: z.ZodOptional<z.ZodNumber>;
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    },
    z.core.$strip
>;
export declare const QuestionSchema: z.ZodObject<
    {
        id: z.ZodUUID;
        type: z.ZodEnum<{
            number: "number";
            short_text: "short_text";
            long_text: "long_text";
            multiple_choice: "multiple_choice";
            checkboxes: "checkboxes";
        }>;
        label: z.ZodString;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodBoolean;
        options: z.ZodOptional<z.ZodArray<z.ZodString>>;
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
        order: z.ZodNumber;
    },
    z.core.$strip
>;
export type Question = z.infer<typeof QuestionSchema>;
export declare const FormConfigSchema: z.ZodObject<
    {
        id: z.ZodUUID;
        organizationId: z.ZodUUID;
        questions: z.ZodArray<
            z.ZodObject<
                {
                    id: z.ZodUUID;
                    type: z.ZodEnum<{
                        number: "number";
                        short_text: "short_text";
                        long_text: "long_text";
                        multiple_choice: "multiple_choice";
                        checkboxes: "checkboxes";
                    }>;
                    label: z.ZodString;
                    placeholder: z.ZodOptional<z.ZodString>;
                    required: z.ZodBoolean;
                    options: z.ZodOptional<z.ZodArray<z.ZodString>>;
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
                    order: z.ZodNumber;
                },
                z.core.$strip
            >
        >;
        createdAt: z.ZodCoercedDate<unknown>;
        updatedAt: z.ZodCoercedDate<unknown>;
    },
    z.core.$strip
>;
export declare const NewFormConfigSchema: z.ZodObject<
    {
        questions: z.ZodArray<
            z.ZodObject<
                {
                    id: z.ZodUUID;
                    type: z.ZodEnum<{
                        number: "number";
                        short_text: "short_text";
                        long_text: "long_text";
                        multiple_choice: "multiple_choice";
                        checkboxes: "checkboxes";
                    }>;
                    label: z.ZodString;
                    placeholder: z.ZodOptional<z.ZodString>;
                    required: z.ZodBoolean;
                    options: z.ZodOptional<z.ZodArray<z.ZodString>>;
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
                    order: z.ZodNumber;
                },
                z.core.$strip
            >
        >;
    },
    z.core.$strip
>;
export type FormConfig = z.infer<typeof FormConfigSchema>;
export declare const FormConfigFactory: {
    create: (
        params: z.input<typeof NewFormConfigSchema>,
        organizationId: Id,
    ) => FormConfig;
    fromDb: (params: z.input<typeof FormConfigSchema>) => FormConfig;
};
