import axios from "axios";
import { fubClientEnv } from "@packages/env";

const fubApi = axios.create({
    baseURL: "https://api.followupboss.com/v1",
    auth: {
        username: fubClientEnv.FUB_API_KEY,
        password: "",
    },
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-System-Key": fubClientEnv.FUB_SYSTEM_KEY,
        "X-System": fubClientEnv.FUB_SYSTEM,
    },
    timeout: 30000,
});

export { fubApi };
