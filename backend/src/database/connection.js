import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoMemoryInstance = null;

export class MongoDBClient {
  static async connect() {
    try {
      let uri = process.env.MONGO_URI;

      if (!uri) {
        try {
          // Intentar conectar a MongoDB local si estuviera disponible
          const conn = await mongoose.connect("mongodb://localhost:27017/ai-ticket-it", {
            serverSelectionTimeoutMS: 1500,
          });
          console.log(`MongoDB conectado en instancia local: ${conn.connection.host}`);
          return;
        } catch {
          // Si no hay instancia local corriendo, iniciar MongoDB Memory Server (en memoria)
          console.log("Iniciando MongoDB en memoria (MongoMemoryServer)...");
          mongoMemoryInstance = await MongoMemoryServer.create();
          uri = mongoMemoryInstance.getUri();
        }
      }

      const conn = await mongoose.connect(uri);
      console.log(`MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Error al conectar MongoDB: ${error.message}`);
      process.exit(1);
    }
  }

  static async disconnect() {
    await mongoose.disconnect();
    if (mongoMemoryInstance) {
      await mongoMemoryInstance.stop();
    }
  }
}
