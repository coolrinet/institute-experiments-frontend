import { apiClient } from '~/lib/api-client';

import { ResearchData } from '~/types/schema';

export async function addResearch(data: ResearchData) {
  await apiClient.post('/api/research', {
    name: data.name,
    description: data.description,
    is_public: data.isPublic,
    participants: data.isPublic === false ? data.participants : [],
    machinery_id: data.machineryId,
  });
}
