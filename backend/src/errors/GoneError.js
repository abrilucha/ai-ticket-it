import { AppError } from "./AppError.js";

export class GoneError extends AppError {
    constructor(message) {
        super(message)
        this.status = 410
    }
}

