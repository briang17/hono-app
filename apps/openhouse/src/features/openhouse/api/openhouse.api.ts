import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/axios";

export interface OpenHouse {
  id: string;
  organizationId: string;
  createdByUserId: string;
  propertyAddress: string;
  listingPrice: number;
  date: string;
  startTime: string;
  endTime: string;
  listingImageUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpenHouseLead {
  id: string;
  openHouseId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  workingWithAgent: boolean;
  submittedAt: string;
}

export interface CreateOpenHouseInput {
  propertyAddress: string;
  listingPrice: number;
  date: string;
  startTime: string;
  endTime: string;
  listingImageUrl?: string;
  notes?: string;
}

export interface CreateOpenHouseLeadInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  workingWithAgent: boolean;
}

const openhouseApi = {
  getOpenHouses: async () => {
    const response = await apiClient.get<{ data: OpenHouse[] }>("/open-houses");
    return response.data.data;
  },

  getOpenHouse: async (id: string) => {
    const response = await apiClient.get<{ data: OpenHouse }>(`/open-houses/${id}`);
    return response.data.data;
  },

  getPublicOpenHouse: async (id: string) => {
    const response = await apiClient.get<{
      data: Pick<OpenHouse, "id" | "propertyAddress" | "date" | "startTime" | "endTime">;
    }>(`/public/open-houses/${id}`);
    return response.data.data;
  },

  createOpenHouse: async (data: CreateOpenHouseInput) => {
    const response = await apiClient.post<{ data: OpenHouse }>("/open-houses", data);
    return response.data.data;
  },

  getOpenHouseLeads: async (id: string) => {
    const response = await apiClient.get<{ data: OpenHouseLead[] }>(`/open-houses/${id}/leads`);
    return response.data.data;
  },

  createOpenHouseLead: async (id: string, data: CreateOpenHouseLeadInput) => {
    const response = await apiClient.post<{ data: OpenHouseLead }>(`/public/open-houses/${id}/sign-in`, data);
    return response.data.data;
  },
};

export function useOpenHouses() {
  return useQuery({
    queryKey: ["open-houses"],
    queryFn: openhouseApi.getOpenHouses,
  });
}

export function useOpenHouse(id: string) {
  return useQuery({
    queryKey: ["open-houses", id],
    queryFn: () => openhouseApi.getOpenHouse(id),
  });
}

export function usePublicOpenHouse(id: string) {
  return useQuery({
    queryKey: ["open-houses", id, "public"],
    queryFn: () => openhouseApi.getPublicOpenHouse(id),
  });
}

export function useCreateOpenHouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: openhouseApi.createOpenHouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-houses"] });
    },
  });
}

export function useOpenHouseLeads(id: string) {
  return useQuery({
    queryKey: ["open-houses", id, "leads"],
    queryFn: () => openhouseApi.getOpenHouseLeads(id),
  });
}

export function useCreateOpenHouseLead(id: string) {
  return useMutation({
    mutationFn: (data: CreateOpenHouseLeadInput) => openhouseApi.createOpenHouseLead(id, data)
  });
}
