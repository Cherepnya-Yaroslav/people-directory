import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type InputHTMLAttributes,
} from "react";
import { X, ArrowUpRight, Users } from "lucide-react";

export function Brand() {
  return (
    <span className="brand">
      people<span className="brand-dot">.</span>
    </span>
  );
}

export function Avatar({
  name,
  src,
  className = "",
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <span className={`avatar ${className}`}>
      {src && !failed ? (
        <img src={src} alt={`Фото: ${name}`} onError={() => setFailed(true)} />
      ) : (
        <span aria-label={name}>{initials}</span>
      )}
    </span>
  );
}

export function Field({
  label,
  error,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  const id = props.id ?? props.name;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {props.required && <span className="required-mark"> *</span>}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
      />
      {error ? (
        <span id={`${id}-error`} className="field-error">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-hint`} className="field-hint">
            {hint}
          </span>
        )
      )}
    </div>
  );
}

export function Sheet({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`sheet ${wide ? "sheet-wide" : ""}`}
      aria-labelledby="sheet-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const box = event.currentTarget.getBoundingClientRect();
          if (event.clientX < box.left) onClose();
        }
      }}
    >
      <div className="sheet-heading">
        <h2 id="sheet-title">{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label="Закрыть"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function EmptyState({
  filtered,
  onReset,
  onAdd,
}: {
  filtered: boolean;
  onReset: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Users size={30} />
      </div>
      <h2>{filtered ? "Никого не нашли" : "Начните с первого сотрудника"}</h2>
      <p>
        {filtered
          ? "Попробуйте другое имя или выберите другой отдел."
          : "Добавьте коллегу — контакты команды будут всегда под рукой."}
      </p>
      <button className="button secondary" onClick={filtered ? onReset : onAdd}>
        {filtered ? "Сбросить фильтры" : "Добавить сотрудника"}
        <ArrowUpRight size={18} />
      </button>
    </div>
  );
}
