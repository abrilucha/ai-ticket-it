import request from 'supertest';
import app from '../src/app.js';
import { inicializarSeedInMemory } from '../src/data/seedInMemory.js';

const ORG_ROCK = 'usr_org_rock';
const ORG_TEATRO = 'usr_org_teatro';
const COMPRADOR_1 = 'usr_comprador_1';

function containsKeyRecursive(obj, targetKey) {
  if (!obj || typeof obj !== 'object') return false;
  if (Array.isArray(obj)) {
    return obj.some((item) => containsKeyRecursive(item, targetKey));
  }
  for (const [key, value] of Object.entries(obj)) {
    if (key === targetKey) return true;
    if (value && typeof value === 'object') {
      if (containsKeyRecursive(value, targetKey)) return true;
    }
  }
  return false;
}

describe('Ajustes Autorizados Fase 4 (A1, A2, A3, A4)', () => {
  beforeEach(async () => {
    await inicializarSeedInMemory();
  });

  test('A1: Crear dos eventos genera IDs de tipos de entrada únicos y la compra en uno no afecta al otro', async () => {
    const resEvt1 = await request(app)
      .post('/eventos')
      .set('x-user-id', ORG_ROCK)
      .send({
        nombre: 'Evento Unico 1',
        descripcion: 'Descripcion de prueba 1',
        categoria: 'cat_recitales',
        fecha: '2027-05-10T20:00:00.000Z',
        tiposEntrada: [
          { nombre: 'Campo A', precio: 10000, cupo: 100 },
          { nombre: 'VIP A', precio: 25000, cupo: 50 },
        ],
      });
    expect(resEvt1.status).toBe(201);
    const tipos1 = resEvt1.body.tiposEntrada;

    const resEvt2 = await request(app)
      .post('/eventos')
      .set('x-user-id', ORG_ROCK)
      .send({
        nombre: 'Evento Unico 2',
        descripcion: 'Descripcion de prueba 2',
        categoria: 'cat_recitales',
        fecha: '2027-06-15T20:00:00.000Z',
        tiposEntrada: [
          { nombre: 'Campo B', precio: 8000, cupo: 200 },
          { nombre: 'VIP B', precio: 18000, cupo: 80 },
        ],
      });
    expect(resEvt2.status).toBe(201);
    const tipos2 = resEvt2.body.tiposEntrada;

    // Verificar que ningún ID de tipo se repite
    const ids1 = tipos1.map((t) => t.id);
    const ids2 = tipos2.map((t) => t.id);
    expect(ids1.every((id) => !ids2.includes(id))).toBe(true);

    // Comprar 1 entrada en el primer tipo del evento 1
    const resCompra = await request(app)
      .post('/compras')
      .set('x-user-id', COMPRADOR_1)
      .send({
        eventoId: resEvt1.body.id,
        tipoEntradaId: ids1[0],
        cantidad: 1,
      });
    expect(resCompra.status).toBe(201);

    // El cupo debe bajar en el evento 1 y mantenerse intacto en el evento 2
    const det1 = await request(app).get(`/eventos/${resEvt1.body.id}`).set('x-user-id', COMPRADOR_1);
    const det2 = await request(app).get(`/eventos/${resEvt2.body.id}`).set('x-user-id', COMPRADOR_1);

    const t1 = det1.body.tiposEntrada.find((t) => t.id === ids1[0]);
    const t2 = det2.body.tiposEntrada.find((t) => t.id === ids2[0]);

    expect(t1.cupoRestante).toBe(99);
    expect(t1.cupoDisponible).toBe(99);
    expect(t2.cupoRestante).toBe(200);
    expect(t2.cupoDisponible).toBe(200);
  });

  test('A2: cupoDisponible y cupoRestante coinciden en listados, mis eventos, detalle y ventas, y se liberan al cancelar', async () => {
    // En Cosquín (evt_cosquin) ya hay una compra confirmada de 2 entradas de tipo_rock_1 (cupo inicial 500)
    const resListado = await request(app).get('/eventos').set('x-user-id', COMPRADOR_1);
    const evListado = resListado.body.find((e) => e.id === 'evt_cosquin');
    const tipoListado = evListado.tiposEntrada.find((t) => t.id === 'tipo_rock_1');
    expect(tipoListado.cupoDisponible).toBe(498);

    const resMios = await request(app).get('/eventos/mios').set('x-user-id', ORG_ROCK);
    const evMios = resMios.body.find((e) => e.id === 'evt_cosquin');
    const tipoMios = evMios.tiposEntrada.find((t) => t.id === 'tipo_rock_1');
    expect(tipoMios.cupoDisponible).toBe(498);
    expect(tipoMios.cupoRestante).toBe(498);

    const resDetalle = await request(app).get('/eventos/evt_cosquin').set('x-user-id', COMPRADOR_1);
    const tipoDetalle = resDetalle.body.tiposEntrada.find((t) => t.id === 'tipo_rock_1');
    expect(tipoDetalle.cupoRestante).toBe(498);
    expect(tipoDetalle.cupoDisponible).toBe(498);

    const resVentas = await request(app).get('/eventos/evt_cosquin/compras').set('x-user-id', ORG_ROCK);
    const dispVentas = resVentas.body.disponibilidadPorTipo.find((t) => t.tipoEntradaId === 'tipo_rock_1');
    expect(dispVentas.cupoRestante).toBe(498);
    expect(dispVentas.cupoDisponible).toBe(498);

    // Cancelar la compra cmp_confirmada_1 libera el cupo a 500
    const resCancelar = await request(app).post('/compras/cmp_confirmada_1/cancelar').set('x-user-id', COMPRADOR_1);
    expect(resCancelar.status).toBe(200);

    const resDetallePost = await request(app).get('/eventos/evt_cosquin').set('x-user-id', COMPRADOR_1);
    const tipoPost = resDetallePost.body.tiposEntrada.find((t) => t.id === 'tipo_rock_1');
    expect(tipoPost.cupoRestante).toBe(500);
    expect(tipoPost.cupoDisponible).toBe(500);
  });

  test('A3: email está ausente en todas las respuestas públicas y privadas, excepto en GET /usuarios/me', async () => {
    // 1. GET /usuarios (público)
    const resUsuarios = await request(app).get('/usuarios');
    expect(containsKeyRecursive(resUsuarios.body, 'email')).toBe(false);

    // 2. GET /eventos
    const resEventos = await request(app).get('/eventos').set('x-user-id', COMPRADOR_1);
    expect(containsKeyRecursive(resEventos.body, 'email')).toBe(false);

    // 3. GET /eventos/:id
    const resEvtDetalle = await request(app).get('/eventos/evt_cosquin').set('x-user-id', COMPRADOR_1);
    expect(containsKeyRecursive(resEvtDetalle.body, 'email')).toBe(false);

    // 4. GET /compras/mias
    const resMisCompras = await request(app).get('/compras/mias').set('x-user-id', COMPRADOR_1);
    expect(containsKeyRecursive(resMisCompras.body, 'email')).toBe(false);

    // 5. GET /compras/:id
    const resCompraDetalle = await request(app).get('/compras/cmp_confirmada_1').set('x-user-id', COMPRADOR_1);
    expect(containsKeyRecursive(resCompraDetalle.body, 'email')).toBe(false);

    // 6. GET /eventos/:id/compras
    const resVentas = await request(app).get('/eventos/evt_cosquin/compras').set('x-user-id', ORG_ROCK);
    expect(containsKeyRecursive(resVentas.body, 'email')).toBe(false);

    // 7. GET /organizadores/:id
    const resOrg = await request(app).get('/organizadores/usr_org_rock').set('x-user-id', COMPRADOR_1);
    expect(containsKeyRecursive(resOrg.body, 'email')).toBe(false);

    // 8. GET /usuarios/me (debe contener el email del usuario logueado)
    const resMe = await request(app).get('/usuarios/me').set('x-user-id', COMPRADOR_1);
    expect(resMe.status).toBe(200);
    expect(resMe.body.email).toBe('lucas.garcia@gmail.com');
  });

  test('A4: GET /eventos/:id/compras incluye banderas enriquecidas en cada compra', async () => {
    const res = await request(app).get('/eventos/evt_cosquin/compras').set('x-user-id', ORG_ROCK);
    expect(res.status).toBe(200);
    expect(res.body.compras.length).toBeGreaterThan(0);

    const compraConf = res.body.compras.find((c) => c.estado === 'CONFIRMADA');
    expect(compraConf).toBeDefined();
    expect(compraConf.puedeUtilizar).toBe(true);
    expect(compraConf.puedePagar).toBe(false);
    expect(compraConf.puedeCancelar).toBe(false);
    expect(compraConf.puedeResenar).toBe(false);
    expect(compraConf.diasRestantes).toBeDefined();

    // Comprobar con una compra UTILIZADA en evento pasado Divididos
    const resDivididos = await request(app).get('/eventos/evt_divididos/compras').set('x-user-id', ORG_ROCK);
    const compraUtil = resDivididos.body.compras.find((c) => c.estado === 'UTILIZADA');
    expect(compraUtil).toBeDefined();
    expect(compraUtil.puedeUtilizar).toBe(false);
  });
});
