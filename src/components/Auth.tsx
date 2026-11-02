import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import type { User } from "../../shared/types";
import {
  fieldErrors,
  loginSchema,
  registerSchema,
} from "../../shared/validation";
import { api, ApiError, errorMessage } from "../api";
import { Brand, Field } from "./ui";

export function Auth({
  onAuthenticated,
  sessionExpired,
}: {
  onAuthenticated: (user: User) => void;
  sessionExpired: boolean;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const register = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = (register ? registerSchema : loginSchema).safeParse(data);
    setErrors({});
    setError("");
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    try {
      const result = await api<{ user: User }>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      onAuthenticated(result.user);
    } catch (error) {
      setError(errorMessage(error));
      if (error instanceof ApiError) setErrors(error.fields);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-story" aria-label="О People">
        <Brand />
        <div className="auth-intro">
          <h1>
            Управляйте
            <br /> <span>сотрудниками.</span>
          </h1>
          <p>
            Ваша команда, её таланты и контакты.
            <br />В одном месте.
          </p>
        </div>
        <div className="portrait-composition" aria-hidden="true">
          <div className="portrait-tile portrait-one">
            <img src="/portraits/anna.jpg" alt="" />
            <span>
              Дизайн
              <ArrowUpRight size={16} />
            </span>
          </div>
          <div className="portrait-tile portrait-two">
            <img src="/portraits/mikhail.jpg" alt="" />
            <span>
              Разработка
              <ArrowUpRight size={16} />
            </span>
          </div>
          <div className="portrait-tile portrait-three">
            <img src="/portraits/sofia.jpg" alt="" />
            <span>
              Маркетинг
              <ArrowUpRight size={16} />
            </span>
          </div>
          <span className="together-tag">Разные таланты. Одна команда.</span>
        </div>
        <div className="auth-story-footer">
          <span className="status-dot" /> Ближе к команде. Проще в работе.
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-tabs" aria-label="Авторизация">
            <button
              className={!register ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
                setErrors({});
              }}
              aria-pressed={!register}
            >
              Вход
            </button>
            <button
              className={register ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
                setErrors({});
              }}
              aria-pressed={register}
            >
              Регистрация
            </button>
          </div>
          <h2>{register ? "Давайте знакомиться" : "С возвращением"}</h2>
          <p className="auth-description">
            {register
              ? "Создайте аккаунт — ваша команда уже ждёт."
              : "Войдите, чтобы быть на связи с командой."}
          </p>
          {sessionExpired && (
            <div className="inline-notice" role="status">
              Сессия завершилась. Войдите ещё раз.
            </div>
          )}
          <form onSubmit={submit} noValidate key={mode}>
            {register && (
              <Field
                label="Ваше имя"
                name="name"
                autoComplete="name"
                placeholder="Как к вам обращаться"
                required
                maxLength={80}
                error={errors.name}
              />
            )}
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.ru"
              required
              maxLength={254}
              error={errors.email}
            />
            <div className="password-field">
              <Field
                label="Пароль"
                name="password"
                type={visiblePassword ? "text" : "password"}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder={register ? "Минимум 8 символов" : "Введите пароль"}
                required
                maxLength={128}
                error={errors.password}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setVisiblePassword(!visiblePassword)}
                aria-label={
                  visiblePassword ? "Скрыть пароль" : "Показать пароль"
                }
              >
                {visiblePassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <button className="button primary auth-submit" disabled={busy}>
              {busy
                ? "Подождите…"
                : register
                  ? "Создать аккаунт"
                  : "Войти в команду"}
              {!busy && <ArrowRight size={19} />}
            </button>
          </form>
          <div className="auth-switch">
            {register ? "Уже есть аккаунт?" : "Первый раз здесь?"}{" "}
            <button
              onClick={() => {
                setMode(register ? "login" : "register");
                setError("");
                setErrors({});
              }}
            >
              {register ? "Войти" : "Создать аккаунт"}
            </button>
          </div>
        </div>
        <p className="auth-bottom">People · Команда в одном месте</p>
      </section>
    </main>
  );
}
