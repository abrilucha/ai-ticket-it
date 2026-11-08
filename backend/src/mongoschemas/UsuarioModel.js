import mongoose, { Schema } from "mongoose";

const UsuarioSchema = new Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    rol: {
      type: String,
      enum: ["COMPRADOR", "ORGANIZADOR"],
      default: "COMPRADOR",
      required: true,
    },
    favoritos: [{ type: Schema.Types.ObjectId, ref: "Evento" }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UsuarioModel = mongoose.model("Usuario", UsuarioSchema);
