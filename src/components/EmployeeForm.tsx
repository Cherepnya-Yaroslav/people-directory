import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import type { Employee } from "../../shared/types";
import { employeeSchema, fieldErrors } from "../../shared/validation";
import { api, ApiError, errorMessage } from "../api";
import { Field, Sheet } from "./ui";

export function EmployeeForm({
  departments,
  onClose,
  onCreated,
}: {
  departments: string[];
  onClose: () => void;
  onCreated: (employee: Employee) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const close = () => {
    if (busy) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setError("");
    const parsed = employeeSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      const field = event.currentTarget.elements.namedItem(
        String(parsed.error.issues[0].path[0]),
      );
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    setBusy(true);
    try {
      const result = await api<{ employee: Employee }>("/employees", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      onCreated(result.employee);
    } catch (error) {
      setError(errorMessage(error));
      if (error instanceof ApiError) setErrors(error.fields);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet title="Новый сотрудник" onClose={close} wide>
      <form
        className="employee-form"
        onSubmit={submit}
        noValidate
        onChange={() => setDirty(true)}
      >
        <p className="form-intro">
          Познакомьте команду с новым коллегой.
          <br />
          <span>Поля со звёздочкой обязательны.</span>
        </p>
        <Field
          label="ФИО"
          name="fullName"
          placeholder="Иван Петрович Иванов"
          autoComplete="off"
          required
          maxLength={120}
          error={errors.fullName}
        />
        <Field
          label="Должность"
          name="position"
          placeholder="Например, продуктовый дизайнер"
          required
          maxLength={100}
          error={errors.position}
        />
        <Field
          label="Отдел"
          name="department"
          placeholder="Выберите или введите новый"
          list="department-options"
          required
          maxLength={60}
          error={errors.department}
        />
        <datalist id="department-options">
          {departments.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <div className="form-divider">
          <span>Больше о коллеге</span>
          <span>необязательно</span>
        </div>
        <Field
          label="Рабочий email"
          name="email"
          type="email"
          placeholder="name@company.ru"
          maxLength={254}
          error={errors.email}
        />
        <div className="form-row">
          <Field
            label="Телефон"
            name="phone"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            maxLength={30}
            error={errors.phone}
          />
          <Field
            label="Город"
            name="location"
            placeholder="Москва"
            maxLength={100}
            error={errors.location}
          />
        </div>
        <Field
          label="Дата начала работы"
          name="joinedAt"
          type="date"
          error={errors.joinedAt}
        />
        <Field
          label="Ссылка на фотографию"
          name="photoUrl"
          type="url"
          placeholder="https://example.com/photo.jpg"
          hint="Прямая ссылка на изображение. Если её нет, покажем инициалы."
          maxLength={2048}
          error={errors.photoUrl}
        />
        <div className="field">
          <label htmlFor="bio">О сотруднике</label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={600}
            placeholder="Чем занимается, что любит, с чем поможет"
            aria-invalid={!!errors.bio}
          />
          {errors.bio && <span className="field-error">{errors.bio}</span>}
        </div>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        {confirmClose && (
          <div className="discard-confirm" role="alert">
            <p>Закрыть форму? Введённые данные не сохранятся.</p>
            <div>
              <button
                type="button"
                className="text-button"
                onClick={() => setConfirmClose(false)}
              >
                Продолжить
              </button>
              <button
                type="button"
                className="text-button danger"
                onClick={onClose}
              >
                Закрыть без сохранения
              </button>
            </div>
          </div>
        )}
        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={close}
            disabled={busy}
          >
            Отмена
          </button>
          <button className="button primary" disabled={busy}>
            {busy ? "Сохраняем…" : "Добавить сотрудника"}
            {!busy && <Plus size={18} />}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
