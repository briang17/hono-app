import {createAuthClient} from "better-auth/react";
import {organizationClient} from "better-auth/client/plugins";
import { env } from "../config/env";

const apiurl = env.VITE_API_URL+"/auth";
export const authClient = createAuthClient({
  baseURL: apiurl,
  plugins: [organizationClient()]
});