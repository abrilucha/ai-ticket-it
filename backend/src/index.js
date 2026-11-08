import os from "os";
import app from "./app.js";
import { inicializarSeedInMemory } from "./data/seedInMemory.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = "0.0.0.0";

function obtenerIpsLocales() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

async function startServer() {
  await inicializarSeedInMemory();

  app.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(` Servidor de AI Ticket It iniciado correctamente`);
    console.log(` Persistencia: 100% EN MEMORIA (Repositories)`);
    console.log(` Puerto: ${PORT} | Host: ${HOST}`);
    console.log(` URLs disponibles para conectar el front:`);
    console.log(`   - Local:    http://localhost:${PORT}`);
    const ips = obtenerIpsLocales();
    if (ips.length > 0) {
      ips.forEach((ip) => {
        console.log(`   - Red LAN:  http://${ip}:${PORT}`);
      });
    }
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Usuarios de prueba: http://localhost:${PORT}/usuarios`);
    console.log(`======================================================\n`);
  });
}

startServer();

export default app;
