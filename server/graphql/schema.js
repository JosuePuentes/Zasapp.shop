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
    owner: ID
    plan: String
    rif: String
    companyName: String
    antiquity: Int
    president: String
    workersCount: Int
    address: String
    isDistributor: Boolean
    listPriceVisibility: String
  }

  type BusinessPartner {
    _id: ID!
    store: ID!
    partnerStore: ID!
    isApproved: Boolean!
    discountPercent: Float
    creditDays: Int
    creditLimit: Float
    requestedAt: String
    approvedAt: String
  }

  type B2BBusinessCard {
    storeId: ID!
    storeName: String!
    rif: String
    address: String
    estimatedVolume: String
  }

  type B2BChatMessage {
    _id: ID!
    fromStore: ID!
    toStore: ID!
    body: String!
    isSystem: Boolean!
    createdAt: String
  }

  type Supplier {
    _id: ID!
    store: ID!
    rif: String
    companyName: String!
    contactName: String
    contactPhone: String
    contactEmail: String
    address: String
  }

  type PurchaseItem {
    product: ID!
    quantity: Int!
    unitCost: Float!
    lot: String
    expiryDate: String
  }

  type Purchase {
    _id: ID!
    store: ID!
    supplier: Supplier
    items: [PurchaseItem!]!
    total: Float!
    purchaseDate: String
    paymentCurrency: String
    purchaseCurrencyType: String
    isParallelRate: Boolean
    notes: String
  }

  type Employee {
    _id: ID!
    store: ID!
    name: String!
    position: String
    hasCommission: Boolean!
    commissionPercent: Float
    isActive: Boolean!
  }

  type Expense {
    _id: ID!
    store: ID!
    description: String!
    amount: Float!
    category: String!
    expenseDate: String
  }

  type AccountPayable {
    _id: ID!
    store: ID!
    supplier: Supplier
    purchase: ID
    amount: Float!
    amountPaid: Float!
    dueDate: String!
    status: String!
    paidAt: String
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
    priceWithDiscount: Float
    costPrice: Float
    costCurrency: String
    rateCalleAtCost: Float
    purchaseCurrencyType: String
    isParallelRate: Boolean
    marginPercent: Float
    stock: Int!
    category: String!
    store: Store
    segment: String
    allyDiscountPercent: Float
    allyCreditDays: Int
    allyCreditLimit: Float
    external_id: String
    brand: String
    lot: String
    expiryDate: String
  }

  type Configuration {
    _id: ID
    currency: String
    currencySymbol: String
    deliveryRate: Float
    costType: String
    skipEmailVerification: Boolean
    skipMobileVerification: Boolean
    testOtp: String
    twilioEnabled: Boolean
    webClientID: String
    googleApiKey: String
    webAmplitudeApiKey: String
    googleMapLibraries: String
    googleColor: String
    webSentryUrl: String
    publishableKey: String
    clientId: String
    firebaseKey: String
    authDomain: String
    projectId: String
    storageBucket: String
    msgSenderId: String
    appId: String
    measurementId: String
    vapidKey: String
  }

  type SendOtpResult {
    result: Boolean!
  }

  type VerifyOtpResult {
    result: Boolean!
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

  type DashboardSales {
    totalPhysical: Float!
    totalOnline: Float!
    total: Float!
    expenses: Float!
    accountsPaid: Float!
    net: Float!
  }

  type InventoryByCosteo {
    storeId: ID!
    bcvCount: Int!
    parallelCount: Int!
    bcvValue: Float!
    parallelValue: Float!
  }

  type ExchangeRateRecord {
    _id: ID!
    store: ID!
    rateBcv: Float!
    rateCalle: Float!
    effectiveDate: String
  }

  type LatestRates {
    storeId: ID!
    rateBcv: Float!
    rateCalle: Float!
    differentialPercent: Float!
    effectiveDate: String
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
    clientType: String
    role: String
  }

  input StoreOnboardingInput {
    storeId: ID!
    rif: String
    companyName: String
    antiquity: Int
    president: String
    workersCount: Int
    address: String
    lat: Float
    lng: Float
  }

  input SupplierInput {
    storeId: ID!
    rif: String
    companyName: String!
    contactName: String
    contactPhone: String
    contactEmail: String
    address: String
  }

  input PurchaseItemInput {
    productId: ID!
    quantity: Int!
    unitCost: Float!
    lot: String
    expiryDate: String
  }

  input CreatePurchaseInput {
    storeId: ID!
    supplierId: ID!
    items: [PurchaseItemInput!]!
    paymentCurrency: String
    notes: String
    dueInDays: Int
  }

  input EmployeeInput {
    storeId: ID!
    name: String!
    position: String
    hasCommission: Boolean
    commissionPercent: Float
  }

  input ExpenseInput {
    storeId: ID!
    description: String!
    amount: Float!
    category: String
    expenseDate: String
  }

  input BulkProductInput {
    code: String
    description: String!
    brand: String
    cost: Float!
    marginPercent: Float!
    category: String
    costCurrency: String
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
    clientType: String
  }

  type Query {
    me: User
    profile: Profile
    searchProducts(department: String, clientLat: Float, clientLng: Float, firstStoreId: String): [Product!]!
    searchProductsByStore(storeId: ID!): [Product!]!
    searchProductsComparative(buyerStoreId: ID!, department: String, onlyAllies: Boolean): [Product!]!
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
    storesByOwner(ownerId: ID!): [Store!]!
    suppliersByStore(storeId: ID!): [Supplier!]!
    purchasesByStore(storeId: ID!, limit: Int): [Purchase!]!
    employeesByStore(storeId: ID!): [Employee!]!
    expensesByStore(storeId: ID!, from: String, to: String): [Expense!]!
    accountPayablesByStore(storeId: ID!, status: String): [AccountPayable!]!
    dashboardSales(storeId: ID!, from: String, to: String): DashboardSales
    latestRates(storeId: ID!): LatestRates
    exchangeRatesByStore(storeId: ID!, limit: Int): [ExchangeRateRecord!]!
    inventoryByCosteo(storeId: ID!): InventoryByCosteo
    businessPartnersByStore(storeId: ID!): [BusinessPartner!]!
    businessPartnerRequests(partnerStoreId: ID!): [BusinessPartner!]!
    b2bBusinessCard(storeId: ID!): B2BBusinessCard
    b2bChatMessages(storeId: ID!, partnerStoreId: ID!, limit: Int): [B2BChatMessage!]!
    availableCredit(storeId: ID!, buyerStoreId: ID!): Float!
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
    updateStoreOnboarding(input: StoreOnboardingInput!): Store!
    createSupplier(input: SupplierInput!): Supplier!
    updateSupplier(id: ID!, input: SupplierInput!): Supplier!
    createPurchase(input: CreatePurchaseInput!): Purchase!
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
    createExpense(input: ExpenseInput!): Expense!
    payAccountPayable(id: ID!, amount: Float!): AccountPayable!
    bulkImportProducts(storeId: ID!, products: [BulkProductInput!]!): Int!
    updateExchangeRates(storeId: ID!, rateBcv: Float!, rateCalle: Float!): LatestRates!
    requestBusinessPartner(storeId: ID!, partnerStoreId: ID!): BusinessPartner!
    approveBusinessPartner(id: ID!, discountPercent: Float, creditDays: Int, creditLimit: Float): BusinessPartner!
    sendB2BMessage(storeId: ID!, partnerStoreId: ID!, body: String!): B2BChatMessage!
    sendOtpToEmail(email: String!): SendOtpResult!
    sendOtpToPhoneNumber(phone: String!): SendOtpResult!
    verifyOtp(otp: String!, email: String, phone: String): VerifyOtpResult!
  }
`;

module.exports = typeDefs;
