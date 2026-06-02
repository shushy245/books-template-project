import { httpClient } from './http-client';

type HealthResponse = { status: string };

export const fetchHealth = async (): Promise<HealthResponse> => {
  const response = await httpClient.get<HealthResponse>('/health');
  return response.data;
};
