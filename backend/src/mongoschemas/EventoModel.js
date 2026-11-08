import mongoose, { Schema } from "mongoose";

const TipoEntradaSchema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, default: "" },
    precio: { type: Number, required: true, min: 0 },
    cupo: { type: Number, required: true, min: 0 },
    cupoDisponible: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const EventoSchema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    categoria: { type: Schema.Types.ObjectId, ref: "Categoria", required: true },
    fecha: { type: Date, required: true },
    tiposEntrada: [TipoEntradaSchema],
    multimedia: [{ type: String }],
    organizador: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const EventoModel = mongoose.model("Evento", EventoSchema);
