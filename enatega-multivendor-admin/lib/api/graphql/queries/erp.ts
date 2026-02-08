"use client";
import { gql } from "@apollo/client";

export const STORES_BY_OWNER = gql`
  query StoresByOwner($ownerId: ID!) {
    storesByOwner(ownerId: $ownerId) {
      _id
      name
      status
      department
      plan
      rif
      companyName
      address
      publicName
    }
  }
`;

export const SUPPLIERS_BY_STORE = gql`
  query SuppliersByStore($storeId: ID!) {
    suppliersByStore(storeId: $storeId) {
      _id
      store
      rif
      companyName
      contactName
      contactPhone
      contactEmail
      address
    }
  }
`;

export const PURCHASES_BY_STORE = gql`
  query PurchasesByStore($storeId: ID!, $limit: Int) {
    purchasesByStore(storeId: $storeId, limit: $limit) {
      _id
      store
      supplier {
        _id
        companyName
        rif
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

export const EMPLOYEES_BY_STORE = gql`
  query EmployeesByStore($storeId: ID!) {
    employeesByStore(storeId: $storeId) {
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

export const EXPENSES_BY_STORE = gql`
  query ExpensesByStore($storeId: ID!, $from: String, $to: String) {
    expensesByStore(storeId: $storeId, from: $from, to: $to) {
      _id
      store
      description
      amount
      category
      expenseDate
    }
  }
`;

export const ACCOUNT_PAYABLES_BY_STORE = gql`
  query AccountPayablesByStore($storeId: ID!, $status: String) {
    accountPayablesByStore(storeId: $storeId, status: $status) {
      _id
      store
      supplier {
        _id
        companyName
        rif
      }
      purchase
      amount
      amountPaid
      dueDate
      status
      paidAt
    }
  }
`;

export const DASHBOARD_SALES = gql`
  query DashboardSales($storeId: ID!, $from: String, $to: String) {
    dashboardSales(storeId: $storeId, from: $from, to: $to) {
      totalPhysical
      totalOnline
      total
      expenses
      accountsPaid
      net
    }
  }
`;
