import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Rutas
import healthRoutes from "../routes/HealthCheckRoutes.js";
import usuarioRoutes from "../routes/UsuarioRoutes.js";
import categoriaRoutes from "../routes/CategoriaRoutes.js";
import eventoRoutes from "../routes/EventoRoutes.js";
import compraRoutes from "../routes/CompraRoutes.js";
import organizadorRoutes from "../routes/OrganizadorRoutes.js";
import favoritoRoutes from "../routes/FavoritoRoutes.js";

// Middlewares
import { errorLogger } from "./middlewares/errorLogger.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middlewares base
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Middleware de autenticación simulada (lee x-user-id del header y setea req.user)
app.use((req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (userId) {
    req.user = { id: userId };
  }
  next();
});

// 3. Montaje de rutas
app.use("/health", healthRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/eventos", eventoRoutes);
app.use("/compras", compraRoutes);
app.use("/organizadores", organizadorRoutes);
app.use("/favoritos", favoritoRoutes);

// 4. Middlewares de errores
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

// 5. Iniciar servidor
app.listen(PORT, () => {
  console.log(` Servidor corriendo exitosamente en http://localhost:${PORT}`);
  console.log(` Health check disponible en http://localhost:${PORT}/health`);
});

export default app;