import mongoose, { Schema } from "mongoose";

const CambioEstadoCompraSchema = new Schema(
  {
    compra: { type: Schema.Types.ObjectId, ref: "Compra", required: true },
    estado: {
      type: String,
      enum: ["PENDIENTE", "CONFIRMADA", "UTILIZADA", "CANCELADA", "REEMBOLSADA"],
      required: true,
    },
    quien: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    fechaHora: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const CambioEstadoCompraModel = mongoose.model("CambioEstadoCompra", CambioEstadoCompraSchema);
