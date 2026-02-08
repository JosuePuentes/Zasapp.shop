import { gql } from "@apollo/client";

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($department: String) {
    searchProducts(department: $department) {
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
      }
    }
  }
`;
