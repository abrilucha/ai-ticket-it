import mongoose, { Schema } from "mongoose";

const CategoriaSchema = new Schema(
  {
    nombre: { type: String, required: true, unique: true },
    codigo: { type: String, required: true, unique: true },
    descripcion: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const CategoriaModel = mongoose.model("Categoria", CategoriaSchema);
