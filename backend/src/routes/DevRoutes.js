import { Router } from "express";
import { inicializarSeedInMemory } from "../data/seedInMemory.js";

const router = Router();

router.post("/reset", async (req, res, next) => {
  if (process.env.ENABLE_DEV_ENDPOINTS !== "true") {
    return next(); // Pasa al notFoundHandler para responder 404
  }

  try {
    await inicializarSeedInMemory();
    res.status(200).json({
      ok: true,
      mensaje: "Datos restaurados al seed original exitosamente",
      status: "ok",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
