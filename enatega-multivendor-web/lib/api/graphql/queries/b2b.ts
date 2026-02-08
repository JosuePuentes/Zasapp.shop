import { gql } from "@apollo/client";

export const B2B_BUSINESS_CARD = gql`
  query B2BBusinessCard($storeId: ID!) {
    b2bBusinessCard(storeId: $storeId) {
      storeId
      storeName
      rif
      address
      estimatedVolume
    }
  }
`;

export const B2B_CHAT_MESSAGES = gql`
  query B2BChatMessages($storeId: ID!, $partnerStoreId: ID!, $limit: Int) {
    b2bChatMessages(storeId: $storeId, partnerStoreId: $partnerStoreId, limit: $limit) {
      _id
      fromStore
      toStore
      body
      isSystem
      createdAt
    }
  }
`;

export const AVAILABLE_CREDIT = gql`
  query AvailableCredit($storeId: ID!, $buyerStoreId: ID!) {
    availableCredit(storeId: $storeId, buyerStoreId: $buyerStoreId)
  }
`;
