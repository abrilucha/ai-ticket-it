import xss from "xss";

const opciones = {
  whiteList: {},                           // no permite ningún tag
  stripIgnoreTag: true,                    // saca los tags en lugar de escaparlos
  stripIgnoreTagBody: ["script", "iframe", "style", "object", "embed"], // y descarta el contenido de estos
};

export const sanitizarValor = (valor) => {
  if (typeof valor === "string") return xss(valor, opciones);
  if (Array.isArray(valor)) return valor.map(sanitizarValor);
  if (valor !== null && typeof valor === "object") return sanitizarObjeto(valor);
  return valor;
};

export const sanitizarObjeto = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [key, sanitizarValor(val)])
  );

export const sanitizarBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizarObjeto(req.body);
  }
  next();
};