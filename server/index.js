const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");

const Product = require("./models/Product");
const Order = require("./models/Order");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

const app = express();

const PORT = process.env.PORT || 8001;
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

// CORS: permitir Frontend en Vercel y localhost
const corsOptions = {
  origin: ["https://zasapp-shop.vercel.app", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "authorization", "userid", "isauth", "x-client-type"],
};
app.use(cors(corsOptions));

// Preflight OPTIONS: respuesta explícita para /graphql
app.options("/graphql", (req, res) => {
  const origin = req.headers.origin;
  const allow = corsOptions.origin.includes(origin) ? origin : corsOptions.origin[0];
  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Access-Control-Allow-Methods", corsOptions.methods.join(", "));
  res.setHeader("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(", "));
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.sendStatus(204);
});

app.use(express.json());

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
  formatError: (err) => {
    console.error("GraphQL error:", err);
    return err;
  },
});

async function start() {
  await apolloServer.start();
  // cors: false porque CORS ya se maneja con Express (corsOptions) arriba
  apolloServer.applyMiddleware({ app, path: "/graphql", cors: false });
}

start().then(() => {
  app.get("/api/products", async (req, res) => {
    try {
      if (!MONGODB_URI) {
        return res.status(503).json({
          error: "Database not configured",
          products: [],
        });
      }
      const products = await Product.find()
        .populate("store")
        .lean()
        .sort({ createdAt: -1 });
      const list = products.map((p) => ({
        ...p,
        price: p.costPrice * (1 + (p.marginPercent || 0) / 100),
      }));
      res.json({ products: list });
    } catch (err) {
      console.error("GET /api/products error:", err);
      res.status(500).json({ error: "Failed to fetch products", products: [] });
    }
  });

  app.get("/", (req, res) => {
    res.json({ ok: true, service: "zasapp-api" });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
