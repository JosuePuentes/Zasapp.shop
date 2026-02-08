const { gql } = require("apollo-server-express");

const typeDefs = gql`
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
    searchProducts(department: String): [Product!]!
    configuration: Configuration
    emailExist(email: String!): User
    phoneExist(phone: String!): User
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
  }
`;

module.exports = typeDefs;
