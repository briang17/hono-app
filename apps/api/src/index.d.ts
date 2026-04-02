import { Hono } from "hono";
declare const app: Hono<
    import("hono/types").BlankEnv,
    import("hono/types").BlankSchema,
    "/"
>;
declare const featureRoutes: import("hono/hono-base").HonoBase<
    import("hono/types").BlankEnv,
    (
        | import("hono/types").BlankSchema
        | import("hono/types").MergeSchemaPath<
              {
                  "/": {
                      $get: {
                          input: {};
                          output: {
                              data: {
                                  id: string;
                                  organizationId: string;
                                  createdByUserId: string;
                                  propertyAddress: string;
                                  listingPrice: number;
                                  date: string;
                                  startTime: string;
                                  endTime: string;
                                  images: {
                                      id: string;
                                      openHouseId: string;
                                      url: string;
                                      publicId: string;
                                      isMain: boolean;
                                      orderIndex: number;
                                      createdAt: string;
                                  }[];
                                  createdAt: string;
                                  updatedAt: string;
                                  notes?: string | null | undefined;
                              }[];
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              } & {
                  "/:id": {
                      $get: {
                          input: {
                              param: {
                                  id: string;
                              };
                          };
                          output: {
                              data: {
                                  id: string;
                                  organizationId: string;
                                  createdByUserId: string;
                                  propertyAddress: string;
                                  listingPrice: number;
                                  date: string;
                                  startTime: string;
                                  endTime: string;
                                  images: {
                                      id: string;
                                      openHouseId: string;
                                      url: string;
                                      publicId: string;
                                      isMain: boolean;
                                      orderIndex: number;
                                      createdAt: string;
                                  }[];
                                  createdAt: string;
                                  updatedAt: string;
                                  notes?: string | null | undefined;
                              };
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              } & {
                  "/:id/leads": {
                      $get: {
                          input: {
                              param: {
                                  id: string;
                              };
                          };
                          output: {
                              data: {
                                  leads: {
                                      id: string;
                                      openHouseId: string;
                                      organizationId: string;
                                      firstName: string;
                                      lastName: string;
                                      workingWithAgent: boolean;
                                      submittedAt: string;
                                      consent: boolean;
                                      email?: string | null | undefined;
                                      phone?: string | null | undefined;
                                      responses?:
                                          | {
                                                [x: string]:
                                                    | string
                                                    | number
                                                    | string[]
                                                    | number[];
                                            }
                                          | null
                                          | undefined;
                                  }[];
                                  formConfig: {
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
                                                    minLength?:
                                                        | number
                                                        | undefined;
                                                    maxLength?:
                                                        | number
                                                        | undefined;
                                                    min?: number | undefined;
                                                    max?: number | undefined;
                                                }
                                              | undefined;
                                          step?: number | undefined;
                                      }[];
                                      createdAt: string;
                                      updatedAt: string;
                                  } | null;
                              };
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              } & {
                  "/": {
                      $post: {
                          input: {
                              json: {
                                  date: unknown;
                                  propertyAddress: string;
                                  listingPrice: number;
                                  startTime: string;
                                  endTime: string;
                                  notes?: string | null | undefined;
                                  images?:
                                      | {
                                            url: string;
                                            publicId: string;
                                            isMain?: boolean | undefined;
                                            orderIndex?: number | undefined;
                                        }[]
                                      | undefined;
                              };
                          };
                          output: {
                              data: {
                                  id: string;
                                  organizationId: string;
                                  createdByUserId: string;
                                  propertyAddress: string;
                                  listingPrice: number;
                                  date: string;
                                  startTime: string;
                                  endTime: string;
                                  images: {
                                      id: string;
                                      openHouseId: string;
                                      url: string;
                                      publicId: string;
                                      isMain: boolean;
                                      orderIndex: number;
                                      createdAt: string;
                                  }[];
                                  createdAt: string;
                                  updatedAt: string;
                                  notes?: string | null | undefined;
                              };
                          };
                          outputFormat: "json";
                          status: 201;
                      };
                  };
              },
              "/api/open-houses"
          >
        | import("hono/types").MergeSchemaPath<
              {
                  "/:id": {
                      $get: {
                          input: {
                              param: {
                                  id: string;
                              };
                          };
                          output: {
                              data: {
                                  id: string;
                                  propertyAddress: string;
                                  date: string;
                                  startTime: string;
                                  endTime: string;
                                  formConfig: {
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
                                                    minLength?:
                                                        | number
                                                        | undefined;
                                                    maxLength?:
                                                        | number
                                                        | undefined;
                                                    min?: number | undefined;
                                                    max?: number | undefined;
                                                }
                                              | undefined;
                                          step?: number | undefined;
                                      }[];
                                      createdAt: string;
                                      updatedAt: string;
                                  } | null;
                                  images: {
                                      id: string;
                                      openHouseId: string;
                                      url: string;
                                      publicId: string;
                                      isMain: boolean;
                                      orderIndex: number;
                                      createdAt: string;
                                  }[];
                              };
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              } & {
                  "/:id/sign-in": {
                      $post: {
                          input: {
                              param: {
                                  id: string;
                              };
                          } & {
                              json: {
                                  firstName: string;
                                  lastName: string;
                                  email?: string | null | undefined;
                                  phone?: string | null | undefined;
                                  workingWithAgent?: boolean | undefined;
                                  consent?: boolean | undefined;
                                  responses?:
                                      | Record<
                                            string,
                                            | string
                                            | number
                                            | string[]
                                            | number[]
                                        >
                                      | null
                                      | undefined;
                              };
                          };
                          output: {
                              data: {
                                  id: string;
                                  openHouseId: string;
                                  organizationId: string;
                                  firstName: string;
                                  lastName: string;
                                  workingWithAgent: boolean;
                                  submittedAt: string;
                                  consent: boolean;
                                  email?: string | null | undefined;
                                  phone?: string | null | undefined;
                                  responses?:
                                      | {
                                            [x: string]:
                                                | string
                                                | number
                                                | string[]
                                                | number[];
                                        }
                                      | null
                                      | undefined;
                              };
                          };
                          outputFormat: "json";
                          status: 201;
                      };
                  };
              },
              "/api/public/open-houses"
          >
        | import("hono/types").MergeSchemaPath<
              {
                  "/": {
                      $get: {
                          input: {};
                          output: {
                              data: {
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
                                  createdAt: string;
                                  updatedAt: string;
                              };
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              } & {
                  "/": {
                      $post: {
                          input: {
                              json: {
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
                              };
                          };
                          output: {
                              data: {
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
                                  createdAt: string;
                                  updatedAt: string;
                              };
                          };
                          outputFormat: "json";
                          status: 201;
                      };
                  };
              } & {
                  "/:id": {
                      $put: {
                          input: {
                              param: {
                                  id: string;
                              };
                          } & {
                              json: {
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
                              };
                          };
                          output: {
                              data: {
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
                                  createdAt: string;
                                  updatedAt: string;
                              };
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              } & {
                  "/:id": {
                      $delete: {
                          input: {
                              param: {
                                  id: string;
                              };
                          };
                          output: {
                              message: string;
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              },
              "/api/form-config"
          >
        | import("hono/types").MergeSchemaPath<
              {
                  "/": {
                      $get: {
                          input: {};
                          output: {
                              data: {
                                  id: string;
                                  userId: string | null;
                                  organizationId: string;
                                  email: string;
                                  firstName: string;
                                  lastName: string;
                                  phone: string | null;
                                  fubId: string | null;
                                  isActive: boolean;
                                  createdAt: string;
                                  updatedAt: string;
                                  userName: string | null;
                              }[];
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              } & {
                  "/:id": {
                      $get: {
                          input: {
                              param: {
                                  id: string;
                              };
                          };
                          output: {
                              data: {
                                  id: string;
                                  userId: string | null;
                                  organizationId: string;
                                  email: string;
                                  firstName: string;
                                  lastName: string;
                                  phone: string | null;
                                  fubId: string | null;
                                  isActive: boolean;
                                  createdAt: string;
                                  updatedAt: string;
                              };
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              } & {
                  "/": {
                      $post: {
                          input: {
                              json: {
                                  email: string;
                                  firstName: string;
                                  lastName: string;
                                  phone: string | null;
                                  fubId: string | null;
                              };
                          };
                          output: {
                              data: {
                                  id: string;
                                  userId: string | null;
                                  organizationId: string;
                                  email: string;
                                  firstName: string;
                                  lastName: string;
                                  phone: string | null;
                                  fubId: string | null;
                                  isActive: boolean;
                                  createdAt: string;
                                  updatedAt: string;
                              };
                          };
                          outputFormat: "json";
                          status: 201;
                      };
                  };
              } & {
                  "/:id": {
                      $patch: {
                          input: {
                              param: {
                                  id: string;
                              };
                          } & {
                              json: {
                                  email?: string | undefined;
                                  firstName?: string | undefined;
                                  lastName?: string | undefined;
                                  phone?: string | null | undefined;
                                  fubId?: string | null | undefined;
                              };
                          };
                          output: {
                              data: {
                                  id: string;
                                  userId: string | null;
                                  organizationId: string;
                                  email: string;
                                  firstName: string;
                                  lastName: string;
                                  phone: string | null;
                                  fubId: string | null;
                                  isActive: boolean;
                                  createdAt: string;
                                  updatedAt: string;
                              };
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              } & {
                  "/:id": {
                      $delete: {
                          input: {
                              param: {
                                  id: string;
                              };
                          };
                          output: null;
                          outputFormat: "body";
                          status: 200;
                      };
                  };
              } & {
                  "/:id/deactivate": {
                      $post: {
                          input: {
                              param: {
                                  id: string;
                              };
                          };
                          output: {
                              data: {
                                  id: string;
                                  userId: string | null;
                                  organizationId: string;
                                  email: string;
                                  firstName: string;
                                  lastName: string;
                                  phone: string | null;
                                  fubId: string | null;
                                  isActive: boolean;
                                  createdAt: string;
                                  updatedAt: string;
                              };
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              } & {
                  "/:id/reactivate": {
                      $post: {
                          input: {
                              param: {
                                  id: string;
                              };
                          };
                          output: {
                              data: {
                                  id: string;
                                  userId: string | null;
                                  organizationId: string;
                                  email: string;
                                  firstName: string;
                                  lastName: string;
                                  phone: string | null;
                                  fubId: string | null;
                                  isActive: boolean;
                                  createdAt: string;
                                  updatedAt: string;
                              };
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              },
              "/api/agents"
          >
        | import("hono/types").MergeSchemaPath<
              {
                  "/signature": {
                      $post: {
                          input: {};
                          output: {
                              data: {
                                  signature: string;
                                  timestamp: number;
                                  apiKey: string;
                                  cloudName: string;
                              };
                          };
                          outputFormat: "json";
                          status: import("hono/utils/http-status").ContentfulStatusCode;
                      };
                  };
              },
              "/api/cloudinary"
          >
    ) & {
        "/health": {
            $get: {
                input: {};
                output: {
                    data: {
                        uptime: string;
                        currentTime: string;
                    };
                };
                outputFormat: "json";
                status: import("hono/utils/http-status").ContentfulStatusCode;
            };
        };
    },
    "/",
    "/health"
>;
export default app;
export type AppType = typeof featureRoutes;
