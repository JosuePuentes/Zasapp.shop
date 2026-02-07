const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Product = require("./models/Product");

const app = express();

// Puerto: Render asigna process.env.PORT; en local usa 8001
const PORT = process.env.PORT || 8001;

// Conexión MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

// CORS: permitir peticiones desde el frontend en Vercel
const allowedOrigins = [
  "https://zasapp-shop.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "authorization",
      "content-type",
      "isauth",
      "userid",
      "x-client-type",
    ],
    credentials: true,
  })
);

// Body parser para GraphQL
app.use(express.json());

// Ruta GraphQL (placeholder: aquí va tu Apollo Server o tu lógica GraphQL real)
app.use("/graphql", (req, res, next) => {
  // Preflight OPTIONS
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || allowedOrigins[0]);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, isauth, userid, x-client-type"
    );
    return res.sendStatus(200);
  }
  // TODO: conectar Apollo Server o tu API GraphQL aquí
  res.status(503).json({
    errors: [{ message: "GraphQL endpoint not configured yet. Add your Apollo Server here." }],
  });
});

// GET /api/products — listar todos los productos
app.get("/api/products", async (req, res) => {
  try {
    if (!MONGODB_URI) {
      return res.status(503).json({
        error: "Database not configured",
        products: [],
      });
    }
    const products = await Product.find().lean().sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ error: "Failed to fetch products", products: [] });
  }
});

// Health check para Render
app.get("/", (req, res) => {
  res.json({ ok: true, service: "zasapp-api" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
