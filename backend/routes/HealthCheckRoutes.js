
import express from 'express';
import {HealthCheckController} from "../src/controllers/HealthCheckController.js"

const router = express.Router();
const healthCheckController = new HealthCheckController();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica el estado del servidor (Health Check)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: El servidor está funcionando correctamente
 */
router.get('/', (req, res) => healthCheckController.getHealth(req, res));

export default router;


