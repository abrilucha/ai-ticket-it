import app from "./app.js";
import { inicializarSeedInMemory } from "./data/seedInMemory.js";

const PORT = process.env.PORT || 3000;

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
