import * as yup from "yup";

import { passwordNotLong } from "./errorMessages";

export const registerPasswordValidation = yup
  .string()
  .min(5, passwordNotLong)
  .max(255);
