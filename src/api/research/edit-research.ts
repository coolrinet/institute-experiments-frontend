import { apiClient } from '~/lib/api-client';

import { ResearchData } from '~/types/schema';

export async function editResearch(researchId: number, data: ResearchData) {
  await apiClient.put(`/api/research/${researchId}`, {
    name: data.name,
    description: data.description,
    is_public: data.isPublic,
    participants: data.isPublic === false ? data.participants : [],
    machinery_id: data.machineryId,
  });
}
