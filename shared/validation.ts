import { z } from "zod";

const requiredText = (label: string, max = 100) =>
  z
    .string()
    .trim()
    .min(1, `Укажите ${label}`)
    .max(max, `Не более ${max} символов`);
const optionalText = (max: number) => z.string().trim().max(max).default("");
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Введите корректный email")
  .max(254);
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Введите пароль").max(128),
});
export const registerSchema = loginSchema.extend({
  name: requiredText("имя", 80),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .max(128, "Не более 128 символов"),
});

export const employeeSchema = z.object({
  fullName: requiredText("ФИО", 120),
  position: requiredText("должность"),
  department: requiredText("отдел", 60),
  email: z.union([emailSchema, z.literal("")]).default(""),
  phone: optionalText(30).refine(
    (v) => !v || /^[+\d\s()−-]{5,30}$/.test(v),
    "Проверьте номер телефона",
  ),
  location: optionalText(100),
  photoUrl: optionalText(2048).refine((v) => {
    if (!v) return true;
    try {
      return new URL(v).protocol === "https:";
    } catch {
      return false;
    }
  }, "Нужна ссылка на изображение, начинающаяся с https://"),
  bio: optionalText(600),
  joinedAt: z.union([z.iso.date(), z.literal("")]).default(""),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  );
}
