import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Kurumsal e-posta adresi zorunludur." })
    .email({ message: "Geçerli bir e-posta adresi giriniz." }),
  password: z
    .string()
    .min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

