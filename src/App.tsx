import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  LayoutGrid,
  List,
  LogOut,
  Plus,
  Search,
  Users,
  X,
  RefreshCw,
} from "lucide-react";
import type { Employee, EmployeeList, User } from "../shared/types";
import { api, ApiError, errorMessage } from "./api";
import { Auth } from "./components/Auth";
import { EmployeeCard } from "./components/EmployeeCard";
import { EmployeeDetail } from "./components/EmployeeDetail";
import { EmployeeForm } from "./components/EmployeeForm";
import { EmployeeSkeleton } from "./components/ShimmerSkeleton";
import { Avatar, Brand, EmptyState } from "./components/ui";

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [initialError, setInitialError] = useState("");
  const [expired, setExpired] = useState(false);
  const checkSession = useCallback(async () => {
    setChecking(true);
    setInitialError("");
    try {
      const result = await api<{ user: User }>("/auth/me");
      setUser(result.user);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401))
        setInitialError(errorMessage(error));
    } finally {
      setChecking(false);
    }
  }, []);
  useEffect(() => {
    void checkSession();
  }, [checkSession]);
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setExpired(true);
    };
    window.addEventListener("session-expired", onExpired);
    return () => window.removeEventListener("session-expired", onExpired);
  }, []);

  if (checking)
    return (
      <div className="app-loading">
        <Brand />
        <span className="loading-line" />
        <p role="status">Открываем ваше пространство…</p>
      </div>
    );
  if (initialError)
    return (
      <div className="app-loading">
        <Brand />
        <p role="alert">{initialError}</p>
        <button className="button primary" onClick={checkSession}>
          <RefreshCw size={18} />
          Повторить
        </button>
      </div>
    );
  if (!user)
    return (
      <Auth
        sessionExpired={expired}
        onAuthenticated={(user) => {
          setUser(user);
          setExpired(false);
        }}
      />
    );
  return (
    <Directory
      key={user.id}
      user={user}
      onLogout={() => {
        setUser(null);
        setExpired(false);
      }}
    />
  );
}

function Directory({ user, onLogout }: { user: User; onLogout: () => void }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [data, setData] = useState<EmployeeList>({
    employees: [],
    departments: [],
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [toast, setToast] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = window.setTimeout(
      async () => {
        try {
          const params = new URLSearchParams({ search, department });
          const result = await api<EmployeeList>(`/employees?${params}`, {
            signal: controller.signal,
          });
          if (!controller.signal.aborted) setData(result);
        } catch (error) {
          if (!controller.signal.aborted) setError(errorMessage(error));
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      },
      search ? 180 : 0,
    );
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [search, department, refresh]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function logout() {
    setLoggingOut(true);
    try {
      await api("/auth/logout", { method: "POST", body: "{}" });
      onLogout();
    } catch (error) {
      setToast(errorMessage(error));
    } finally {
      setLoggingOut(false);
    }
  }

  function openForm() {
    setAdding(true);
    setFormOpen(true);
  }

  function openProfile(employee: Employee) {
    setSelected(employee);
    setProfileOpen(true);
  }

  function created(employee: Employee) {
    setFormOpen(false);
    setSearch("");
    setDepartment("");
    setRefresh((value) => value + 1);
    setToast(`${employee.fullName} — теперь в команде`);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand-link" href="/" aria-label="People — главная">
          <Brand />
        </a>
        <div className="workspace-name">
          <span />
          Рабочее пространство
        </div>
        <div className="header-tab">
          <Users size={17} />
          Сотрудники
        </div>
        <div className="account">
          <Avatar name={user.name} />
          <div className="account-copy">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button
            className="icon-button logout-button"
            onClick={logout}
            disabled={loggingOut}
            aria-label="Выйти из аккаунта"
            title="Выйти"
          >
            <LogOut size={19} />
          </button>
        </div>
      </header>
      <main className="directory-main">
        <div className="page-heading">
          <div>
            <div className="title-row">
              <h1>Сотрудники</h1>
              <span className="team-count">
                {data.total.toString().padStart(2, "0")}
              </span>
            </div>
            <p>
              Разные таланты. <span>Одна команда.</span>
            </p>
          </div>
          <button className="button primary add-button" onClick={openForm}>
            <Plus size={20} />
            Добавить сотрудника
          </button>
        </div>
        <section className="directory-tools" aria-label="Поиск и фильтры">
          <div className="search-row">
            <div className="search-input">
              <Search size={20} />
              <input
                id="employee-search"
                type="search"
                aria-label="Поиск по ФИО"
                placeholder="Найти сотрудника по имени или фамилии"
                value={search}
                maxLength={120}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  className="clear-search"
                  onClick={() => setSearch("")}
                  aria-label="Очистить поиск"
                >
                  <X size={17} />
                </button>
              )}
            </div>
            <div className="view-toggle" aria-label="Вид списка">
              <button
                aria-label="Карточки"
                aria-pressed={view === "grid"}
                className={view === "grid" ? "active" : ""}
                onClick={() => setView("grid")}
              >
                <LayoutGrid size={19} />
              </button>
              <button
                aria-label="Список"
                aria-pressed={view === "list"}
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
              >
                <List size={21} />
              </button>
            </div>
          </div>
          <div className="filter-row">
            <div className="department-filters" aria-label="Фильтр по отделу">
              <button
                aria-pressed={!department}
                className={`filter-chip ${!department ? "active" : ""}`}
                onClick={() => setDepartment("")}
              >
                Все сотрудники <span>{data.total}</span>
              </button>
              {data.departments.map((item) => (
                <button
                  key={item.name}
                  aria-pressed={department === item.name}
                  className={`filter-chip ${department === item.name ? "active" : ""}`}
                  onClick={() => setDepartment(item.name)}
                >
                  {item.name}
                  <span>{item.count}</span>
                </button>
              ))}
            </div>
            <span className="result-count" aria-live="polite">
              {loading
                ? "Обновляем…"
                : `${data.employees.length} из ${data.total}`}
            </span>
          </div>
        </section>
        {error ? (
          <div className="error-state" role="alert">
            <h2>Не удалось загрузить команду</h2>
            <p>{error}</p>
            <button
              className="button secondary"
              onClick={() => setRefresh((value) => value + 1)}
            >
              <RefreshCw size={17} />
              Попробовать снова
            </button>
          </div>
        ) : loading ? (
          <EmployeeSkeleton view={view} />
        ) : data.employees.length === 0 ? (
          <EmptyState
            filtered={!!search || !!department}
            onReset={() => {
              setSearch("");
              setDepartment("");
            }}
            onAdd={openForm}
          />
        ) : (
          <section
            className={`employee-grid ${view === "list" ? "list-view" : ""}`}
            aria-label="Список сотрудников"
          >
            {data.employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onOpen={openProfile}
              />
            ))}
            {!search && !department && view === "grid" && (
              <button className="add-card" onClick={openForm}>
                <span className="add-card-icon">
                  <Plus size={28} strokeWidth={1.5} />
                </span>
                <span className="add-card-title">
                  В команде есть
                  <br />
                  место для новых людей
                </span>
                <span className="add-card-action">
                  Добавить коллегу
                  <ArrowRight size={17} />
                </span>
              </button>
            )}
          </section>
        )}
        <footer className="directory-footer">
          <span>
            <span className="status-dot" />
            Ваша команда — всегда рядом
          </span>
          <span>Демо-профили и контакты вымышлены</span>
        </footer>
      </main>
      {selected && (
        <EmployeeDetail
          employee={selected}
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          onExited={() => setSelected(null)}
        />
      )}
      {adding && (
        <EmployeeForm
          departments={data.departments.map((item) => item.name)}
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onExited={() => setAdding(false)}
          onCreated={created}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={19} />
          <span>{toast}</span>
          <button aria-label="Закрыть уведомление" onClick={() => setToast("")}>
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
