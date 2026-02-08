const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type DriverDocuments {
    license: String
    medicalCert: String
    circulationCard: String
    plate: String
  }

  type DriverProfile {
    vehicleBrand: String
    vehicleModel: String
    vehicleYear: Int
    vehicleType: String
    documents: DriverDocuments
    verificationStatus: String
  }

  type User {
    _id: ID!
    userId: ID!
    name: String!
    lastName: String
    phone: String
    email: String
    deliveryAddress: String
    role: String!
    emailIsVerified: Boolean
    phoneIsVerified: Boolean
    isActive: Boolean
    driverProfile: DriverProfile
  }

  type AuthPayload {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    name: String!
    lastName: String
    phone: String
    phoneIsVerified: Boolean
    email: String
    emailIsVerified: Boolean
    picture: String
    addresses: [AddressPayload]
    deliveryAddress: String
    isNewUser: Boolean
    userTypeId: String
    isActive: Boolean
  }

  type AddressPayload {
    location: LocationPayload
    deliveryAddress: String
  }

  type LocationPayload {
    coordinates: [Float]
  }

  type Store {
    _id: ID!
    name: String!
    status: String!
    isActive: Boolean!
    department: String
    lat: Float
    lng: Float
    publicName: String
    brandColor: String
  }

  type DeliveryFeeResult {
    deliveryFee: Float!
    isFlashRate: Boolean!
    totalDistanceKm: Float!
    message: String
  }

  type Product {
    _id: ID!
    name: String!
    price: Float!
    costPrice: Float
    marginPercent: Float
    stock: Int!
    category: String!
    store: Store
    external_id: String
  }

  type Configuration {
    _id: ID
    currency: String
    currencySymbol: String
    deliveryRate: Float
    costType: String
  }

  type RouteStopItem {
    productName: String
    productId: ID
    quantity: Int
  }

  type RouteStop {
    sequence: Int!
    storeId: ID
    storeName: String
    lat: Float!
    lng: Float!
    items: [RouteStopItem!]
    completedAt: String
  }

  type Route {
    _id: ID!
    orderId: ID
    driver: ID
    stops: [RouteStop!]!
    deliveryLat: Float!
    deliveryLng: Float!
    deliveryAddress: String
    status: String!
    totalDeliveryFee: Float
    driverEarnings: Float
    platformEarnings: Float
    estimatedDistanceKm: Float
    estimatedMinutes: Int
    createdAt: String
  }

  type WalletTransaction {
    orderId: ID!
    totalDeliveryFee: Float!
    driverAmount: Float!
    platformAmount: Float!
    createdAt: String
  }

  type DeliveryWallet {
    driver: ID!
    balance: Float!
    platformShareTotal: Float!
    transactions: [WalletTransaction!]
  }

  type DeliveryTabulator {
    pricePerKm: Float!
    minFee: Float!
    driverPercent: Int!
    platformPercent: Int!
  }

  input CreateUserInput {
    name: String!
    lastName: String
    phone: String
    email: String
    password: String!
    deliveryAddress: String
    notificationToken: String
    appleId: String
    emailIsVerified: Boolean
    isPhoneExists: Boolean
  }

  input UpdateDriverProfileInput {
    vehicleBrand: String
    vehicleModel: String
    vehicleYear: Int
    vehicleType: String
    documentLicense: String
    documentMedicalCert: String
    documentCirculationCard: String
    documentPlate: String
  }

  type UserAddress {
    _id: ID
    label: String
    deliveryAddress: String
    details: String
    location: LocationPayload
    selected: Boolean
  }

  type Profile {
    _id: ID!
    name: String
    phone: String
    phoneIsVerified: Boolean
    email: String
    emailIsVerified: Boolean
    notificationToken: String
    isOrderNotification: Boolean
    isOfferNotification: Boolean
    addresses: [UserAddress]
    favourite: [ID]
    role: String
  }

  type Query {
    me: User
    profile: Profile
    searchProducts(department: String, clientLat: Float, clientLng: Float, firstStoreId: String): [Product!]!
    searchProductsByStore(storeId: ID!): [Product!]!
    storesByIds(storeIds: [ID!]!): [Store!]!
    calculateDeliveryFee(storeIds: [ID!]!, clientLat: Float!, clientLng: Float!): DeliveryFeeResult!
    configuration: Configuration
    emailExist(email: String!): User
    phoneExist(phone: String!): User
    deliveryTabulator: DeliveryTabulator!
    driverWallet: DeliveryWallet
    driverRoutes: [Route!]!
    driverAvailableRoutes: [Route!]!
    route(routeId: ID!): Route
  }

  type Mutation {
    createUser(userInput: CreateUserInput!): AuthPayload!
    login(
      type: String!
      email: String
      password: String
      name: String
      notificationToken: String
      isActive: Boolean
    ): AuthPayload!
    updateDriverProfile(input: UpdateDriverProfileInput!): User!
    takeRoute(routeId: ID!): Route!
    updateRouteStatus(routeId: ID!, status: String!): Route!
    reportDriverLocation(routeId: ID!, lat: Float!, lng: Float!): Boolean
  }
`;

module.exports = typeDefs;
