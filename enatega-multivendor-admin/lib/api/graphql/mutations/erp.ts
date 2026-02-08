"use client";
import { gql } from "@apollo/client";

export const UPDATE_STORE_ONBOARDING = gql`
  mutation UpdateStoreOnboarding($input: StoreOnboardingInput!) {
    updateStoreOnboarding(input: $input) {
      _id
      name
      rif
      companyName
      antiquity
      president
      workersCount
      address
      plan
    }
  }
`;

export const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($input: SupplierInput!) {
    createSupplier(input: $input) {
      _id
      store
      companyName
      rif
      contactName
      contactPhone
      contactEmail
      address
    }
  }
`;

export const UPDATE_SUPPLIER = gql`
  mutation UpdateSupplier($id: ID!, $input: SupplierInput!) {
    updateSupplier(id: $id, input: $input) {
      _id
      companyName
      rif
      contactName
      contactPhone
      contactEmail
      address
    }
  }
`;

export const CREATE_PURCHASE = gql`
  mutation CreatePurchase($input: CreatePurchaseInput!) {
    createPurchase(input: $input) {
      _id
      store
      supplier {
        _id
        companyName
      }
      items {
        product
        quantity
        unitCost
        lot
        expiryDate
      }
      total
      purchaseDate
      notes
    }
  }
`;

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      _id
      store
      name
      position
      hasCommission
      commissionPercent
      isActive
    }
  }
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: EmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      _id
      name
      position
      hasCommission
      commissionPercent
      isActive
    }
  }
`;

export const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: ExpenseInput!) {
    createExpense(input: $input) {
      _id
      store
      description
      amount
      category
      expenseDate
    }
  }
`;

export const PAY_ACCOUNT_PAYABLE = gql`
  mutation PayAccountPayable($id: ID!, $amount: Float!) {
    payAccountPayable(id: $id, amount: $amount) {
      _id
      amount
      amountPaid
      status
      paidAt
    }
  }
`;

export const BULK_IMPORT_PRODUCTS = gql`
  mutation BulkImportProducts($storeId: ID!, $products: [BulkProductInput!]!) {
    bulkImportProducts(storeId: $storeId, products: $products)
  }
`;
