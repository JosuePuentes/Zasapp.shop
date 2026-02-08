import { gql } from "@apollo/client";

export const ROUTE_FRAGMENT = gql`
  fragment RouteFields on Route {
    _id
    orderId
    driver
    stops {
      sequence
      storeId
      storeName
      lat
      lng
      items {
        productName
        productId
        quantity
      }
      completedAt
    }
    deliveryLat
    deliveryLng
    deliveryAddress
    status
    totalDeliveryFee
    driverEarnings
    platformEarnings
    estimatedDistanceKm
    estimatedMinutes
    createdAt
  }
`;

export const DRIVER_ROUTES = gql`
  query DriverRoutes {
    driverRoutes {
      ...RouteFields
    }
  }
  ${ROUTE_FRAGMENT}
`;

export const DRIVER_AVAILABLE_ROUTES = gql`
  query DriverAvailableRoutes {
    driverAvailableRoutes {
      ...RouteFields
    }
  }
  ${ROUTE_FRAGMENT}
`;

export const ROUTE_BY_ID = gql`
  query RouteById($routeId: ID!) {
    route(routeId: $routeId) {
      ...RouteFields
    }
  }
  ${ROUTE_FRAGMENT}
`;

export const DRIVER_WALLET = gql`
  query DriverWallet {
    driverWallet {
      driver
      balance
      platformShareTotal
      transactions {
        orderId
        totalDeliveryFee
        driverAmount
        platformAmount
        createdAt
      }
    }
  }
`;

export const DELIVERY_TABULATOR = gql`
  query DeliveryTabulator {
    deliveryTabulator {
      pricePerKm
      minFee
      driverPercent
      platformPercent
    }
  }
`;
