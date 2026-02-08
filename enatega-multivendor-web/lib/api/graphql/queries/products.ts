import { gql } from "@apollo/client";

/** Pass clientLat, clientLng (e.g. from user address) and/or firstStoreId (first store in cart) to sort results by proximity. */
export const SEARCH_PRODUCTS = gql`
  query SearchProducts($department: String, $clientLat: Float, $clientLng: Float, $firstStoreId: String) {
    searchProducts(department: $department, clientLat: $clientLat, clientLng: $clientLng, firstStoreId: $firstStoreId) {
      _id
      name
      price
      costPrice
      marginPercent
      stock
      category
      external_id
      store {
        _id
        name
        status
        isActive
        department
        lat
        lng
        publicName
        brandColor
      }
    }
  }
`;

export const SEARCH_PRODUCTS_BY_STORE = gql`
  query SearchProductsByStore($storeId: ID!) {
    searchProductsByStore(storeId: $storeId) {
      _id
      name
      price
      costPrice
      marginPercent
      stock
      category
      external_id
      store {
        _id
        name
        status
        isActive
        department
        lat
        lng
        publicName
        brandColor
      }
    }
  }
`;

export const STORES_BY_IDS = gql`
  query StoresByIds($storeIds: [ID!]!) {
    storesByIds(storeIds: $storeIds) {
      _id
      name
      publicName
      brandColor
    }
  }
`;

export const CALCULATE_DELIVERY_FEE = gql`
  query CalculateDeliveryFee($storeIds: [ID!]!, $clientLat: Float!, $clientLng: Float!) {
    calculateDeliveryFee(storeIds: $storeIds, clientLat: $clientLat, clientLng: $clientLng) {
      deliveryFee
      isFlashRate
      totalDistanceKm
      message
    }
  }
`;
