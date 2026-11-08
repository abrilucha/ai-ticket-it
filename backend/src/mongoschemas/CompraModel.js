import mongoose, { Schema } from "mongoose";

const MensajeSchema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    mensaje: { type: String, required: true },
    enviado: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CompraSchema = new Schema(
  {
    comprador: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    evento: { type: Schema.Types.ObjectId, ref: "Evento", required: true },
    tipoEntrada: {
      tipoEntradaId: { type: Schema.Types.ObjectId, required: true },
      nombre: { type: String, required: true },
      precio: { type: Number, required: true },
    },
    cantidad: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ["PENDIENTE", "CONFIRMADA", "UTILIZADA", "CANCELADA", "REEMBOLSADA"],
      default: "PENDIENTE",
      required: true,
    },
    mensajes: [MensajeSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const CompraModel = mongoose.model("Compra", CompraSchema);
