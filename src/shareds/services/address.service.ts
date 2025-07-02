import apiClient from "./apiClient";
import { City, Country, Region } from "@/shareds/types/addresse";

export const addressService = {
  async getRegions(): Promise<Region[]> {
    const response = await apiClient.get("/address/regions");
    return response.data;
  },

  async getCountries(): Promise<Country[]> {
    const response = await apiClient.get("/address/countries");
    return response.data;
  },

  async getCities(): Promise<City[]> {
    const response = await apiClient.get(`/address/cities`);
    return response.data;
  },
};
