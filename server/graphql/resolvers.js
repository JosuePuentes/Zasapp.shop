const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Store = require("../models/Store");
const Product = require("../models/Product");

const JWT_SECRET = process.env.JWT_SECRET || "zasapp-dev-secret-change-in-production";
const TOKEN_EXPIRATION = "7d";

const createToken = (user) =>
  jwt.sign(
    { userId: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );

const authPayloadFromUser = (user, token) => ({
  userId: user._id.toString(),
  token: token || createToken(user),
  tokenExpiration: 604800,
  name: user.name || "",
  lastName: user.lastName || "",
  phone: user.phone || "",
  phoneIsVerified: user.phoneIsVerified ?? false,
  email: user.email || "",
  emailIsVerified: user.emailIsVerified ?? false,
  picture: "",
  addresses: user.deliveryAddress
    ? [{ deliveryAddress: user.deliveryAddress, location: null }]
    : [],
  deliveryAddress: user.deliveryAddress || "",
  isNewUser: false,
  userTypeId: user.role,
  isActive: user.isActive !== false,
});

const getUserId = (req) => {
  const auth = req.headers?.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
};

const resolvers = {
  Query: {
    async me(_, __, { req }) {
      const userId = getUserId(req);
      if (!userId) return null;
      const user = await User.findById(userId).select("+password").lean();
      return user ? { ...user, userId: user._id.toString() } : null;
    },

    async profile(_, __, { req }) {
      const userId = getUserId(req);
      if (!userId) return null;
      const user = await User.findById(userId).lean();
      if (!user) return null;
      const address = user.deliveryAddress
        ? [
            {
              _id: user._id.toString(),
              label: "Principal",
              deliveryAddress: user.deliveryAddress,
              details: "",
              location: null,
              selected: true,
            },
          ]
        : [];
      return {
        _id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        phoneIsVerified: user.phoneIsVerified ?? false,
        email: user.email,
        emailIsVerified: user.emailIsVerified ?? false,
        notificationToken: null,
        isOrderNotification: true,
        isOfferNotification: true,
        addresses: address,
        favourite: [],
        role: user.role,
      };
    },

    async searchProducts(_, { department }) {
      const query = department ? { category: department } : {};
      const products = await Product.find(query).populate("store").lean();
      const filtered = products.filter(
        (p) => p.store && p.store.status === "APPROVED" && p.store.isActive === true
      );
      return filtered.map((p) => {
        const finalPrice = p.costPrice * (1 + (p.marginPercent || 0) / 100);
        return {
          ...p,
          _id: p._id.toString(),
          price: Math.round(finalPrice * 100) / 100,
          store: p.store
            ? {
                ...p.store,
                _id: p.store._id.toString(),
              }
            : null,
        };
      });
    },

    configuration() {
      return {
        _id: null,
        currency: "USD",
        currencySymbol: "$",
        deliveryRate: 0,
        costType: "perKM",
      };
    },

    async emailExist(_, { email }) {
      const user = await User.findOne({ email: email?.toLowerCase() }).lean();
      return user ? { _id: user._id.toString(), userType: user.role } : null;
    },

    async phoneExist(_, { phone }) {
      const user = await User.findOne({ phone }).lean();
      return user ? { _id: user._id.toString() } : null;
    },
  },

  Mutation: {
    async createUser(_, { userInput }) {
      const { name, lastName, phone, email, password, deliveryAddress } = userInput || {};
      if (!name || !password) throw new Error("Nombre y contraseña son obligatorios");
      if (email) {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) throw new Error("El correo ya está registrado");
      }
      if (phone) {
        const existing = await User.findOne({ phone });
        if (existing) throw new Error("El teléfono ya está registrado");
      }
      const user = await User.create({
        name,
        lastName: lastName || "",
        phone: phone || "",
        email: (email || "").toLowerCase(),
        password,
        deliveryAddress: deliveryAddress || "",
        role: "CLIENT",
      });
      const token = createToken(user);
      return authPayloadFromUser(user, token);
    },

    async login(_, { type, email, password }) {
      if (type !== "email" && type !== "credentials") {
        return authPayloadFromUser({ name: "", role: "CLIENT" }, "");
      }
      const user = await User.findOne({
        $or: [{ email: (email || "").toLowerCase() }, { phone: email }],
      })
        .select("+password")
        .lean();
      if (!user) throw new Error("Credenciales inválidas");
      const UserModel = require("../models/User");
      const doc = await UserModel.findById(user._id);
      const ok = await doc.comparePassword(password || "");
      if (!ok) throw new Error("Credenciales inválidas");
      const token = createToken(user);
      return authPayloadFromUser({ ...user, deliveryAddress: user.deliveryAddress }, token);
    },
  },
};

module.exports = resolvers;
