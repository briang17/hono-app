import { z } from "zod";
export declare const GetFormConfigParamsSchema: z.ZodObject<{}, z.core.$strip>;
export declare const CreateFormConfigBodySchema: z.ZodObject<
    {
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
    },
    z.core.$strip
>;
export declare const UpdateFormConfigParamsSchema: z.ZodObject<
    {
        id: z.ZodUUID;
    },
    z.core.$strip
>;
export declare const UpdateFormConfigBodySchema: z.ZodObject<
    {
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
    },
    z.core.$strip
>;
export declare const DeleteFormConfigParamsSchema: z.ZodObject<
    {
        id: z.ZodUUID;
    },
    z.core.$strip
>;
