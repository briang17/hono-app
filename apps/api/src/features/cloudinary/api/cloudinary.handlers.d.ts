export declare const getSignatureHandlers: [
    import("hono/types").H<
        import("../../../lib/types").OrgEnv,
        string,
        {},
        Response &
            import("hono").TypedResponse<
                {
                    data: {
                        signature: string;
                        timestamp: number;
                        apiKey: string;
                        cloudName: string;
                    };
                },
                import("hono/utils/http-status").ContentfulStatusCode,
                "json"
            >
    >,
];
