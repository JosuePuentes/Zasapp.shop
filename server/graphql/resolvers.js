const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Store = require("../models/Store");
const Product = require("../models/Product");
const DeliveryWallet = require("../models/DeliveryWallet");
const Route = require("../models/Route");
const { splitFee } = require("../models/DeliveryWallet");

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

function coordsFromPoint(point) {
  if (!point?.coordinates || point.coordinates.length < 2) return { lat: 0, lng: 0 };
  return { lat: point.coordinates[1], lng: point.coordinates[0] };
}

const FLASH_DELIVERY_FEE = 1.5;
const FLASH_MAX_KM = 2;
const DEFAULT_MIN_FEE = 2.5;
const DEFAULT_PRICE_PER_KM = 1.5;
const EXTRA_STOP_FEE = 1.0;
const FALLBACK_STORE_COLORS = ["#22c55e", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899", "#14b8a6", "#eab308", "#ef4444"];
function storeBrandColor(store) {
  if (store?.brandColor) return store.brandColor;
  if (!store?._id) return FALLBACK_STORE_COLORS[0];
  let h = 0;
  for (let i = 0; i < store._id.toString().length; i++) h = (h << 5) - h + store._id.toString().charCodeAt(i);
  return FALLBACK_STORE_COLORS[Math.abs(h) % FALLBACK_STORE_COLORS.length];
}
function storePublicName(store) {
  if (store?.publicName) return store.publicName;
  return store?.name || "Zas!";
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function routeToGraphQL(r) {
  const deliveryCoords = coordsFromPoint(r.deliveryLocation);
  return {
    _id: r._id.toString(),
    orderId: r.orderId?.toString(),
    driver: r.driver?.toString(),
    stops: (r.stops || []).map((s) => ({
      sequence: s.sequence,
      storeId: s.storeId?.toString(),
      storeName: s.storeName,
      lat: s.location?.coordinates?.[1] ?? 0,
      lng: s.location?.coordinates?.[0] ?? 0,
      items: s.items || [],
      completedAt: s.completedAt?.toISOString?.(),
    })),
    deliveryLat: deliveryCoords.lat,
    deliveryLng: deliveryCoords.lng,
    deliveryAddress: r.deliveryAddress,
    status: r.status || "PENDING",
    totalDeliveryFee: r.totalDeliveryFee,
    driverEarnings: r.driverEarnings,
    platformEarnings: r.platformEarnings,
    estimatedDistanceKm: r.estimatedDistanceKm,
    estimatedMinutes: r.estimatedMinutes,
    createdAt: r.createdAt?.toISOString?.(),
  };
}

const resolvers = {
  Query: {
    async me(_, __, { req }) {
      const userId = getUserId(req);
      if (!userId) return null;
      const user = await User.findById(userId).select("+password").lean();
      if (!user) return null;
      const driverProfile = user.driverProfile
        ? {
            ...user.driverProfile,
            verificationStatus: user.driverProfile.verificationStatus || "PENDING",
          }
        : null;
      return {
        ...user,
        userId: user._id.toString(),
        driverProfile,
      };
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

    async searchProducts(_, { department, clientLat, clientLng, firstStoreId }) {
      const query = department ? { category: department } : {};
      const products = await Product.find(query).populate("store").lean();
      const filtered = products.filter(
        (p) => p.store && p.store.status === "APPROVED" && p.store.isActive === true
      );
      let result = filtered.map((p) => {
        const finalPrice = p.costPrice * (1 + (p.marginPercent || 0) / 100);
        const store = p.store
          ? {
              ...p.store,
              _id: p.store._id.toString(),
              lat: p.store.location?.coordinates?.[1],
              lng: p.store.location?.coordinates?.[0],
              publicName: storePublicName(p.store),
              brandColor: storeBrandColor(p.store),
            }
          : null;
        return {
          ...p,
          _id: p._id.toString(),
          price: Math.round(finalPrice * 100) / 100,
          store,
        };
      });

      if ((clientLat != null && clientLng != null) || firstStoreId) {
        const ref = { lat: clientLat, lng: clientLng };
        if (firstStoreId) {
          const firstStore = await Store.findById(firstStoreId).lean();
          if (firstStore?.location?.coordinates?.length >= 2) {
            ref.lat = ref.lat ?? firstStore.location.coordinates[1];
            ref.lng = ref.lng ?? firstStore.location.coordinates[0];
          }
        }
        if (ref.lat != null && ref.lng != null) {
          const storeDistance = (s) => {
            if (!s?.location?.coordinates?.length) return Infinity;
            return haversineKm(
              ref.lat,
              ref.lng,
              s.location.coordinates[1],
              s.location.coordinates[0]
            );
          };
          const byStoreId = new Map();
          result.forEach((p) => {
            const sid = p.store?._id;
            if (!byStoreId.has(sid)) byStoreId.set(sid, storeDistance(p.store));
          });
          result.sort((a, b) => {
            const dA = byStoreId.get(a.store?._id) ?? Infinity;
            const dB = byStoreId.get(b.store?._id) ?? Infinity;
            return dA - dB;
          });
        }
      }

      return result;
    },

    async storesByIds(_, { storeIds }) {
      if (!storeIds?.length) return [];
      const stores = await Store.find({ _id: { $in: storeIds } }).lean();
      return stores.map((s) => ({
        ...s,
        _id: s._id.toString(),
        publicName: storePublicName(s),
        brandColor: storeBrandColor(s),
      }));
    },

    async searchProductsByStore(_, { storeId }) {
      if (!storeId) return [];
      const products = await Product.find({ store: storeId }).populate("store").lean();
      const filtered = products.filter(
        (p) => p.store && p.store.status === "APPROVED" && p.store.isActive === true
      );
      return filtered.map((p) => {
        const finalPrice = p.costPrice * (1 + (p.marginPercent || 0) / 100);
        const store = p.store
          ? {
              ...p.store,
              _id: p.store._id.toString(),
              lat: p.store.location?.coordinates?.[1],
              lng: p.store.location?.coordinates?.[0],
              publicName: storePublicName(p.store),
              brandColor: storeBrandColor(p.store),
            }
          : null;
        return {
          ...p,
          _id: p._id.toString(),
          price: Math.round(finalPrice * 100) / 100,
          store,
        };
      });
    },

    async calculateDeliveryFee(_, { storeIds, clientLat, clientLng }) {
      if (!storeIds?.length || clientLat == null || clientLng == null) {
        return {
          deliveryFee: DEFAULT_MIN_FEE,
          isFlashRate: false,
          totalDistanceKm: 0,
          message: "Datos insuficientes",
        };
      }
      const uniqueStoreIds = [...new Set(storeIds.map((id) => id?.toString()).filter(Boolean))];
      const numStores = uniqueStoreIds.length;
      const stores = await Store.find({ _id: { $in: uniqueStoreIds } }).lean();
      const withLocation = stores.filter(
        (s) => s.location?.coordinates?.length >= 2
      );
      const singleStore = numStores === 1 && withLocation.length === 1;
      let totalDistanceKm = 0;
      if (singleStore) {
        const [lng, lat] = withLocation[0].location.coordinates;
        totalDistanceKm = haversineKm(clientLat, clientLng, lat, lng);
      } else if (withLocation.length > 0) {
        for (const s of withLocation) {
          const [lng, lat] = s.location.coordinates;
          totalDistanceKm += haversineKm(clientLat, clientLng, lat, lng);
        }
        totalDistanceKm = Math.round(totalDistanceKm * 100) / 100;
      }
      const isFlashRate =
        singleStore && totalDistanceKm < FLASH_MAX_KM && totalDistanceKm >= 0;
      let deliveryFee;
      if (isFlashRate) {
        deliveryFee = FLASH_DELIVERY_FEE;
      } else if (numStores > 1) {
        deliveryFee = FLASH_DELIVERY_FEE + (numStores - 1) * EXTRA_STOP_FEE;
      } else {
        deliveryFee = Math.max(
          DEFAULT_MIN_FEE,
          Math.ceil(totalDistanceKm) * DEFAULT_PRICE_PER_KM
        );
      }
      return {
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        isFlashRate: !!isFlashRate,
        totalDistanceKm,
        message: isFlashRate
          ? "Tarifa Flash: una tienda y menos de 2 km"
          : numStores > 1
            ? `Recargo por ${numStores} paradas: +$${(numStores - 1) * EXTRA_STOP_FEE}`
            : null,
      };
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

    deliveryTabulator() {
      return {
        pricePerKm: 1.5,
        minFee: 2.5,
        driverPercent: 92,
        platformPercent: 8,
      };
    },

    async driverWallet(_, __, { req }) {
      const userId = getUserId(req);
      if (!userId) return null;
      const user = await User.findById(userId).lean();
      if (!user || user.role !== "DRIVER") return null;
      const wallet = await DeliveryWallet.findOne({ driver: userId }).lean();
      if (!wallet) return null;
      return {
        driver: wallet.driver.toString(),
        balance: wallet.balance ?? 0,
        platformShareTotal: wallet.platformShareTotal ?? 0,
        transactions: (wallet.transactions || []).map((t) => ({
          orderId: t.orderId?.toString(),
          totalDeliveryFee: t.totalDeliveryFee,
          driverAmount: t.driverAmount,
          platformAmount: t.platformAmount,
          createdAt: t.createdAt?.toISOString?.(),
        })),
      };
    },

    async driverRoutes(_, __, { req }) {
      const userId = getUserId(req);
      if (!userId) return [];
      const routes = await Route.find({ driver: userId })
        .sort({ createdAt: -1 })
        .lean();
      return routes.map(routeToGraphQL);
    },

    async driverAvailableRoutes(_, __, { req }) {
      const userId = getUserId(req);
      if (!userId) return [];
      const user = await User.findById(userId).lean();
      const driverProfile = user?.driverProfile;
      if (!driverProfile || driverProfile.verificationStatus !== "VERIFIED") return [];
      const routes = await Route.find({ driver: null, status: "PENDING" })
        .sort({ createdAt: -1 })
        .lean();
      return routes.map(routeToGraphQL);
    },

    async route(_, { routeId }, { req }) {
      const userId = getUserId(req);
      if (!routeId) return null;
      const r = await Route.findById(routeId).lean();
      if (!r) return null;
      if (userId && r.driver?.toString() === userId) return routeToGraphQL(r);
      if (userId && !r.driver) {
        const user = await User.findById(userId).lean();
        if (user?.driverProfile?.verificationStatus === "VERIFIED") return routeToGraphQL(r);
      }
      return null;
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

    async updateDriverProfile(_, { input }, { req }) {
      const userId = getUserId(req);
      if (!userId) throw new Error("No autorizado");
      const user = await User.findById(userId);
      if (!user) throw new Error("Usuario no encontrado");
      if (user.role !== "DRIVER") throw new Error("Solo drivers pueden actualizar este perfil");
      const dp = user.driverProfile || {};
      if (input.vehicleBrand != null) dp.vehicleBrand = input.vehicleBrand;
      if (input.vehicleModel != null) dp.vehicleModel = input.vehicleModel;
      if (input.vehicleYear != null) dp.vehicleYear = input.vehicleYear;
      if (input.vehicleType != null) dp.vehicleType = input.vehicleType;
      if (input.documentLicense != null) {
        if (!dp.documents) dp.documents = {};
        dp.documents.license = input.documentLicense;
      }
      if (input.documentMedicalCert != null) {
        if (!dp.documents) dp.documents = {};
        dp.documents.medicalCert = input.documentMedicalCert;
      }
      if (input.documentCirculationCard != null) {
        if (!dp.documents) dp.documents = {};
        dp.documents.circulationCard = input.documentCirculationCard;
      }
      if (input.documentPlate != null) {
        if (!dp.documents) dp.documents = {};
        dp.documents.plate = input.documentPlate;
      }
      user.driverProfile = dp;
      await user.save();
      const updated = await User.findById(userId).lean();
      const driverProfile = updated.driverProfile
        ? { ...updated.driverProfile, verificationStatus: updated.driverProfile.verificationStatus || "PENDING" }
        : null;
      return { ...updated, userId: updated._id.toString(), driverProfile };
    },

    async takeRoute(_, { routeId }, { req }) {
      const userId = getUserId(req);
      if (!userId) throw new Error("No autorizado");
      const user = await User.findById(userId).lean();
      const dp = user?.driverProfile;
      if (!dp || dp.verificationStatus !== "VERIFIED") throw new Error("Driver no verificado");
      const route = await Route.findOne({ _id: routeId, driver: null, status: "PENDING" });
      if (!route) throw new Error("Ruta no disponible");
      route.driver = userId;
      route.status = "ASSIGNED";
      await route.save();
      return routeToGraphQL(route.toObject());
    },

    async updateRouteStatus(_, { routeId, status }, { req }) {
      const userId = getUserId(req);
      if (!userId) throw new Error("No autorizado");
      const route = await Route.findOne({ _id: routeId, driver: userId });
      if (!route) throw new Error("Ruta no encontrada");
      const allowed = ["ASSIGNED", "AT_STORE", "PICKED_UP", "AT_DESTINATION", "DELIVERED"];
      if (!allowed.includes(status)) throw new Error("Estado no válido");
      route.status = status;
      if (status === "DELIVERED" && route.totalDeliveryFee != null) {
        const { driverAmount, platformAmount } = splitFee(route.totalDeliveryFee);
        route.driverEarnings = driverAmount;
        route.platformEarnings = platformAmount;
        let wallet = await DeliveryWallet.findOne({ driver: userId });
        if (!wallet) wallet = await DeliveryWallet.create({ driver: userId });
        wallet.balance = (wallet.balance || 0) + driverAmount;
        wallet.platformShareTotal = (wallet.platformShareTotal || 0) + platformAmount;
        wallet.transactions.push({
          orderId: route.orderId,
          totalDeliveryFee: route.totalDeliveryFee,
          driverAmount,
          platformAmount,
        });
        await wallet.save();
      }
      await route.save();
      return routeToGraphQL(route.toObject());
    },

    async reportDriverLocation(_, { routeId, lat, lng }, { req }) {
      const userId = getUserId(req);
      if (!userId) return false;
      const route = await Route.findOne({ _id: routeId, driver: userId });
      if (!route) return false;
      // Store last position for tracking; could be saved to a DriverLocation collection
      return true;
    },
  },
};

module.exports = resolvers;
