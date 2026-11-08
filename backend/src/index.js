import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { inicializarSeedInMemory } from "./data/seedInMemory.js";

// Rutas
import healthRoutes from "../routes/HealthCheckRoutes.js";
import usuarioRoutes from "../routes/UsuarioRoutes.js";
import categoriaRoutes from "../routes/CategoriaRoutes.js";
import eventoRoutes from "../routes/EventoRoutes.js";
import compraRoutes from "../routes/CompraRoutes.js";
import organizadorRoutes from "../routes/OrganizadorRoutes.js";
import favoritoRoutes from "../routes/FavoritoRoutes.js";

// Middlewares
import { authSimulada } from "./middlewares/authSimulada.js";
import { errorLogger } from "./middlewares/errorLogger.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authSimulada);

// 2. Registro de rutas
app.use("/health", healthRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/eventos", eventoRoutes);
app.use("/compras", compraRoutes);
app.use("/organizadores", organizadorRoutes);
app.use("/favoritos", favoritoRoutes);

// 3. Middlewares de errores
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

// 4. Inicializar persistencia en memoria y arrancar servidor
async function startServer() {
  await inicializarSeedInMemory();

  app.listen(PORT, () => {
    console.log(` Servidor de AI Ticket It corriendo con persistencia EN MEMORIA`);
    console.log(` Escuchando en http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Usuarios seed: http://localhost:${PORT}/usuarios`);
  });
}

startServer();

export default app;
