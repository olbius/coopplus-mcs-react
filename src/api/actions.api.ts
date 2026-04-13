import { apiClient } from './client';

export const actionsApi = {
  changeOrderStatus: (orderId: string, statusId: string) =>
    apiClient.post('/services/changeOrderStatusREST', { orderId, statusId }),

  createFacility: (data: { facilityId: string; facilityName: string; ownerPartyId?: string }) =>
    apiClient.post('/services/createFacilityREST', data),

  createFacilityPartyRole: (data: { facilityId: string; partyId: string; roleTypeId: string }) =>
    apiClient.post('/services/createFacilityPartyRoleREST', data),

  changeTransferStatus: (transferId: string, statusId: string) =>
    apiClient.post('/services/changeTransferStatus', { transferId, statusId }),

  changeRequirementStatus: (requirementId: string, statusId: string) =>
    apiClient.post('/services/changeRequirementStatus', { requirementId, statusId }),

  createTransfer: (data: { transferTypeId: string; originFacilityId: string; destFacilityId: string; description?: string }) =>
    apiClient.post('/services/createTransfer', data),

  createRequirement: (data: { requirementTypeId: string; listProducts: Record<string, unknown>[]; requiredByDate: string; requirementStartDate: string; reasonEnumId: string; statusId?: string; originFacilityId?: string }) =>
    apiClient.post('/services/createNewRequirement', data),

  createEnumeration: (data: { enumId: string; enumTypeId: string; enumCode?: string; description: string; sequenceId?: string }) =>
    apiClient.post('/services/createEnumerationREST', data),

  createPartyClassGroup: (data: { partyClassificationGroupId: string; description: string }) =>
    apiClient.post('/services/createPartyClassGroupREST', data),

  quickCreateDelivery: (orderId: string) =>
    apiClient.post('/services/quickCreateDelivery', { orderId }),

  exportProductFromRequirement: (data: { requirementId: string; facilityId: string; contactMechId: string; listRequirementItems: string }) =>
    apiClient.post('/services/exportProductFromRequirement', data),

  receiveProductFromRequirement: (data: { requirementId: string; facilityId: string; contactMechId: string; listRequirementItems: string }) =>
    apiClient.post('/services/receiveProductFromRequirement', data),

  quickCreateRetailStore: (data: Record<string, string>) =>
    apiClient.post('/services/quickCreateRetailStore', data),
};
