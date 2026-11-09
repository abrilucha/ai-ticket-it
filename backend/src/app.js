import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Rutas (todas bajo src/routes/)
import healthRoutes from "./routes/HealthCheckRoutes.js";
import authRoutes from "./routes/AuthRoutes.js";
import usuarioRoutes from "./routes/UsuarioRoutes.js";
import categoriaRoutes from "./routes/CategoriaRoutes.js";
import eventoRoutes from "./routes/EventoRoutes.js";
import compraRoutes from "./routes/CompraRoutes.js";
import organizadorRoutes from "./routes/OrganizadorRoutes.js";
import devRoutes from "./routes/DevRoutes.js";

// Middlewares
import { authSimulada } from "./middlewares/authSimulada.js";
import { requireAuth } from "./middlewares/requireAuth.js";
import { errorLogger } from "./middlewares/errorLogger.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// 1. Middlewares globales
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(authSimulada);
app.use(requireAuth);

// 2. Registro de rutas
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/eventos", eventoRoutes);
app.use("/compras", compraRoutes);
app.use("/organizadores", organizadorRoutes);
app.use("/dev", devRoutes);

// 3. Middlewares de errores
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
