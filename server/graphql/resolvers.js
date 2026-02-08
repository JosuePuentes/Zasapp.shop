const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Store = require("../models/Store");
const Product = require("../models/Product");
const DeliveryWallet = require("../models/DeliveryWallet");
const Route = require("../models/Route");
const { splitFee } = require("../models/DeliveryWallet");
const Supplier = require("../models/Supplier");
const Purchase = require("../models/Purchase");
const Employee = require("../models/Employee");
const Expense = require("../models/Expense");
const AccountPayable = require("../models/AccountPayable");

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

    async storesByOwner(_, { ownerId }) {
      if (!ownerId) return [];
      const stores = await Store.find({ owner: ownerId }).lean();
      return stores.map((s) => ({
        ...s,
        _id: s._id.toString(),
        owner: s.owner?.toString(),
      }));
    },

    async suppliersByStore(_, { storeId }) {
      if (!storeId) return [];
      const list = await Supplier.find({ store: storeId }).lean();
      return list.map((s) => ({ ...s, _id: s._id.toString(), store: s.store?.toString() }));
    },

    async purchasesByStore(_, { storeId, limit: limitArg }) {
      if (!storeId) return [];
      const limit = Math.min(limitArg || 50, 200);
      const list = await Purchase.find({ store: storeId })
        .populate("supplier")
        .sort({ purchaseDate: -1 })
        .limit(limit)
        .lean();
      return list.map((p) => ({
        _id: p._id.toString(),
        store: p.store?.toString(),
        supplier: p.supplier ? { ...p.supplier, _id: p.supplier._id.toString(), store: p.supplier.store?.toString() } : null,
        items: (p.items || []).map((i) => ({
          product: i.product?.toString(),
          quantity: i.quantity,
          unitCost: i.unitCost,
          lot: i.lot,
          expiryDate: i.expiryDate?.toISOString?.(),
        })),
        total: p.total,
        purchaseDate: p.purchaseDate?.toISOString?.(),
        notes: p.notes,
      }));
    },

    async employeesByStore(_, { storeId }) {
      if (!storeId) return [];
      const list = await Employee.find({ store: storeId }).lean();
      return list.map((e) => ({
        ...e,
        _id: e._id.toString(),
        store: e.store?.toString(),
      }));
    },

    async expensesByStore(_, { storeId, from, to }) {
      if (!storeId) return [];
      const q = { store: storeId };
      if (from || to) {
        q.expenseDate = {};
        if (from) q.expenseDate.$gte = new Date(from);
        if (to) q.expenseDate.$lte = new Date(to);
      }
      const list = await Expense.find(q).sort({ expenseDate: -1 }).lean();
      return list.map((e) => ({
        ...e,
        _id: e._id.toString(),
        store: e.store?.toString(),
        expenseDate: e.expenseDate?.toISOString?.(),
      }));
    },

    async accountPayablesByStore(_, { storeId, status: statusFilter }) {
      if (!storeId) return [];
      const q = { store: storeId };
      if (statusFilter) q.status = statusFilter;
      const list = await AccountPayable.find(q).populate("supplier").sort({ dueDate: 1 }).lean();
      return list.map((a) => ({
        _id: a._id.toString(),
        store: a.store?.toString(),
        supplier: a.supplier ? { ...a.supplier, _id: a.supplier._id.toString(), store: a.supplier.store?.toString() } : null,
        purchase: a.purchase?.toString(),
        amount: a.amount,
        amountPaid: a.amountPaid ?? 0,
        dueDate: a.dueDate?.toISOString?.(),
        status: a.status,
        paidAt: a.paidAt?.toISOString?.(),
      }));
    },

    async dashboardSales(_, { storeId, from, to }) {
      if (!storeId) return { totalPhysical: 0, totalOnline: 0, total: 0, expenses: 0, accountsPaid: 0, net: 0 };
      const mongoose = require("mongoose");
      const fromD = from ? new Date(from) : new Date(0);
      const toD = to ? new Date(to) : new Date();
      const storeObjId = mongoose.Types.ObjectId.isValid(storeId) ? new mongoose.Types.ObjectId(storeId) : null;
      if (!storeObjId) return { totalPhysical: 0, totalOnline: 0, total: 0, expenses: 0, accountsPaid: 0, net: 0 };
      const Order = require("../models/Order");
      const delivered = await Order.find({ status: "DELIVERED", createdAt: { $gte: fromD, $lte: toD } }).lean();
      let totalOnline = 0;
      for (const o of delivered) {
        const route = await Route.findOne({ orderId: o._id }).lean();
        if (route && route.driver && o.deliveryFee) totalOnline += o.deliveryFee;
      }
      const expenses = await Expense.aggregate([{ $match: { store: storeObjId, expenseDate: { $gte: fromD, $lte: toD } } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]);
      const paid = await AccountPayable.aggregate([{ $match: { store: storeObjId, status: "PAID", paidAt: { $gte: fromD, $lte: toD } } }, { $group: { _id: null, sum: { $sum: "$amountPaid" } } }]);
      const expSum = expenses[0]?.sum ?? 0;
      const paidSum = paid[0]?.sum ?? 0;
      const total = Math.round(totalOnline * 100) / 100;
      return {
        totalPhysical: 0,
        totalOnline,
        total,
        expenses: expSum,
        accountsPaid: paidSum,
        net: Math.round((total - expSum - paidSum) * 100) / 100,
      };
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
      return true;
    },

    async updateStoreOnboarding(_, { input }) {
      const { storeId, rif, companyName, antiquity, president, workersCount, address, lat, lng } = input || {};
      const store = await Store.findById(storeId);
      if (!store) throw new Error("Tienda no encontrada");
      if (rif != null) store.rif = rif;
      if (companyName != null) store.companyName = companyName;
      if (antiquity != null) store.antiquity = antiquity;
      if (president != null) store.president = president;
      if (workersCount != null) store.workersCount = workersCount;
      if (address != null) store.address = address;
      if (lat != null && lng != null) store.location = { type: "Point", coordinates: [lng, lat] };
      await store.save();
      const s = await Store.findById(storeId).lean();
      return { ...s, _id: s._id.toString(), owner: s.owner?.toString() };
    },

    async createSupplier(_, { input }) {
      const { storeId, rif, companyName, contactName, contactPhone, contactEmail, address } = input || {};
      if (!storeId || !companyName) throw new Error("storeId y companyName son obligatorios");
      const sup = await Supplier.create({
        store: storeId,
        rif: rif || "",
        companyName,
        contactName: contactName || "",
        contactPhone: contactPhone || "",
        contactEmail: (contactEmail || "").toLowerCase(),
        address: address || "",
      });
      const s = await Supplier.findById(sup._id).lean();
      return { ...s, _id: s._id.toString(), store: s.store?.toString() };
    },

    async updateSupplier(_, { id, input }) {
      const sup = await Supplier.findById(id);
      if (!sup) throw new Error("Proveedor no encontrado");
      if (input.rif != null) sup.rif = input.rif;
      if (input.companyName != null) sup.companyName = input.companyName;
      if (input.contactName != null) sup.contactName = input.contactName;
      if (input.contactPhone != null) sup.contactPhone = input.contactPhone;
      if (input.contactEmail != null) sup.contactEmail = input.contactEmail;
      if (input.address != null) sup.address = input.address;
      await sup.save();
      const s = await Supplier.findById(id).lean();
      return { ...s, _id: s._id.toString(), store: s.store?.toString() };
    },

    async createPurchase(_, { input }) {
      const { storeId, supplierId, items, notes, dueInDays } = input || {};
      if (!storeId || !supplierId || !items?.length) throw new Error("storeId, supplierId e items son obligatorios");
      let total = 0;
      const purchaseItems = [];
      for (const it of items) {
        const lineTotal = it.quantity * it.unitCost;
        total += lineTotal;
        purchaseItems.push({
          product: it.productId,
          quantity: it.quantity,
          unitCost: it.unitCost,
          lot: it.lot || undefined,
          expiryDate: it.expiryDate ? new Date(it.expiryDate) : undefined,
        });
        const product = await Product.findById(it.productId);
        if (product) {
          product.stock = (product.stock || 0) + it.quantity;
          if (it.lot) product.lot = it.lot;
          if (it.expiryDate) product.expiryDate = new Date(it.expiryDate);
          await product.save();
        }
      }
      const purchase = await Purchase.create({
        store: storeId,
        supplier: supplierId,
        items: purchaseItems,
        total: Math.round(total * 100) / 100,
        notes: notes || "",
      });
      const due = new Date();
      due.setDate(due.getDate() + (dueInDays || 30));
      await AccountPayable.create({
        store: storeId,
        supplier: supplierId,
        purchase: purchase._id,
        amount: purchase.total,
        dueDate: due,
        status: "PENDING",
      });
      const p = await Purchase.findById(purchase._id).populate("supplier").lean();
      return {
        _id: p._id.toString(),
        store: p.store?.toString(),
        supplier: p.supplier ? { ...p.supplier, _id: p.supplier._id.toString(), store: p.supplier.store?.toString() } : null,
        items: (p.items || []).map((i) => ({ product: i.product?.toString(), quantity: i.quantity, unitCost: i.unitCost, lot: i.lot, expiryDate: i.expiryDate?.toISOString?.() })),
        total: p.total,
        purchaseDate: p.purchaseDate?.toISOString?.(),
        notes: p.notes,
      };
    },

    async createEmployee(_, { input }) {
      const { storeId, name, position, hasCommission, commissionPercent } = input || {};
      if (!storeId || !name) throw new Error("storeId y name son obligatorios");
      const emp = await Employee.create({
        store: storeId,
        name,
        position: position || "",
        hasCommission: hasCommission ?? false,
        commissionPercent: commissionPercent ?? 0,
      });
      const e = await Employee.findById(emp._id).lean();
      return { ...e, _id: e._id.toString(), store: e.store?.toString() };
    },

    async updateEmployee(_, { id, input }) {
      const emp = await Employee.findById(id);
      if (!emp) throw new Error("Empleado no encontrado");
      if (input.name != null) emp.name = input.name;
      if (input.position != null) emp.position = input.position;
      if (input.hasCommission != null) emp.hasCommission = input.hasCommission;
      if (input.commissionPercent != null) emp.commissionPercent = input.commissionPercent;
      await emp.save();
      const e = await Employee.findById(id).lean();
      return { ...e, _id: e._id.toString(), store: e.store?.toString() };
    },

    async createExpense(_, { input }) {
      const { storeId, description, amount, category, expenseDate } = input || {};
      if (!storeId || !description || amount == null) throw new Error("storeId, description y amount son obligatorios");
      const exp = await Expense.create({
        store: storeId,
        description,
        amount: Number(amount),
        category: category || "OTHER",
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      });
      const e = await Expense.findById(exp._id).lean();
      return { ...e, _id: e._id.toString(), store: e.store?.toString(), expenseDate: e.expenseDate?.toISOString?.() };
    },

    async payAccountPayable(_, { id, amount }) {
      const ap = await AccountPayable.findById(id);
      if (!ap) throw new Error("Cuenta por pagar no encontrada");
      const paid = (ap.amountPaid || 0) + Number(amount);
      ap.amountPaid = paid;
      ap.status = paid >= ap.amount ? "PAID" : "PARTIAL";
      if (ap.status === "PAID") ap.paidAt = new Date();
      await ap.save();
      const a = await AccountPayable.findById(id).populate("supplier").lean();
      return {
        _id: a._id.toString(),
        store: a.store?.toString(),
        supplier: a.supplier ? { ...a.supplier, _id: a.supplier._id.toString(), store: a.supplier.store?.toString() } : null,
        purchase: a.purchase?.toString(),
        amount: a.amount,
        amountPaid: a.amountPaid,
        dueDate: a.dueDate?.toISOString?.(),
        status: a.status,
        paidAt: a.paidAt?.toISOString?.(),
      };
    },

    async bulkImportProducts(_, { storeId, products: productsInput }) {
      if (!storeId || !productsInput?.length) throw new Error("storeId y products son obligatorios");
      let count = 0;
      for (const row of productsInput) {
        const name = row.description || row.code || "Producto";
        const cost = Number(row.cost) || 0;
        const margin = Number(row.marginPercent) || 0;
        const category = row.category || "Farmacia";
        await Product.create({
          store: storeId,
          name,
          costPrice: cost,
          marginPercent: margin,
          stock: 0,
          category: ["Farmacia", "Repuestos"].includes(category) ? category : "Farmacia",
          external_id: row.code || undefined,
          brand: row.brand || undefined,
        });
        count++;
      }
      return count;
    },
  },
};

module.exports = resolvers;
