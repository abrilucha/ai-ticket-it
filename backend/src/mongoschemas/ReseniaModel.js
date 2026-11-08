import mongoose, { Schema } from "mongoose";

const ReseniaSchema = new Schema(
  {
    comprador: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    evento: { type: Schema.Types.ObjectId, ref: "Evento", required: true },
    compra: { type: Schema.Types.ObjectId, ref: "Compra", required: true },
    detalle: { type: String, required: true },
    puntuacion: { type: Number, required: true, min: 1, max: 5 },
    fecha: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ReseniaModel = mongoose.model("Resenia", ReseniaSchema);
