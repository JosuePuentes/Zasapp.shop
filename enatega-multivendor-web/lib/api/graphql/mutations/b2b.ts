import { gql } from "@apollo/client";

export const REQUEST_BUSINESS_PARTNER = gql`
  mutation RequestBusinessPartner($storeId: ID!, $partnerStoreId: ID!) {
    requestBusinessPartner(storeId: $storeId, partnerStoreId: $partnerStoreId) {
      _id
      store
      partnerStore
      isApproved
    }
  }
`;

export const SEND_B2B_MESSAGE = gql`
  mutation SendB2BMessage($storeId: ID!, $partnerStoreId: ID!, $body: String!) {
    sendB2BMessage(storeId: $storeId, partnerStoreId: $partnerStoreId, body: $body) {
      _id
      fromStore
      toStore
      body
      isSystem
      createdAt
    }
  }
`;

export const APPROVE_BUSINESS_PARTNER = gql`
  mutation ApproveBusinessPartner($id: ID!, $discountPercent: Float, $creditDays: Int, $creditLimit: Float) {
    approveBusinessPartner(id: $id, discountPercent: $discountPercent, creditDays: $creditDays, creditLimit: $creditLimit) {
      _id
      store
      partnerStore
      isApproved
      discountPercent
      creditDays
      creditLimit
      approvedAt
    }
  }
`;
