import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/axios";

export interface Organization {
	id: string;
	name: string;
	slug: string;
	createdAt: string;
	logo: string | null;
	metadata: Record<string, any>;
	members: Member[];
}

export interface Member {
	id: string;
	organizationId: string;
	userId: string;
	role: string;
	createdAt: string;
}

export type CreateOrganizationInput = {
	name: string;
	slug: string;
};

export const organizationApi = {
	createOrganization: async (data: CreateOrganizationInput) => {
		const response = await apiClient.post<{ data: Organization }>("/auth/organization/create", data);
		return response.data.data;
	},

	setActiveOrganization: async (organizationId: string) => {
		const response = await apiClient.post<{ data: Organization }>("/auth/organization/set-active", { organizationId });
		return response.data.data;
	},

	listOrganizations: async () => {
		const response = await apiClient.get<{ data: Organization[] }>("/auth/organization/list");
		return response.data.data;
	},

	checkOrganizationSlug: async (slug: string) => {
		const response = await apiClient.post<{ data: { status: boolean } }>("/auth/organization/check-slug", { slug });
		return response.data.data.status;
	},
};

export function useListOrganizations() {
	return useQuery({
		queryKey: ["organizations"],
		queryFn: organizationApi.listOrganizations,
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateOrganization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: organizationApi.createOrganization,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["organizations"] });
		},
	});
}

export function useSetActiveOrganization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: organizationApi.setActiveOrganization,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["session"] });
		},
	});
}

export function useCheckOrganizationSlug() {
	return useMutation({
		mutationFn: organizationApi.checkOrganizationSlug,
	});
}
