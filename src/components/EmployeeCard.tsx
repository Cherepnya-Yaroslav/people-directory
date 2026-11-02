import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import type { Employee } from "../../shared/types";
import { Avatar } from "./ui";

export function departmentTone(department: string) {
  if (department === "Дизайн") return "pink";
  if (department === "Разработка") return "blue";
  if (department === "Маркетинг") return "lilac";
  return "neutral";
}

export function EmployeeCard({
  employee,
  onOpen,
}: {
  employee: Employee;
  onOpen: (employee: Employee) => void;
}) {
  const parts = employee.fullName.split(" ");
  const displayName =
    parts.length >= 3 ? `${parts[0]} ${parts.at(-1)}` : employee.fullName;
  return (
    <article
      className={`employee-card tone-${departmentTone(employee.department)}`}
    >
      <div className="card-top">
        <Avatar name={employee.fullName} src={employee.photoUrl} />
        <span
          className={`department-badge ${departmentTone(employee.department)}`}
        >
          <span />
          {employee.department}
        </span>
      </div>
      <div className="employee-identity">
        <h2>
          <button onClick={() => onOpen(employee)} title={employee.fullName}>
            {displayName}
          </button>
        </h2>
        <p className="full-name">{employee.fullName}</p>
        <p className="employee-position">
          {employee.position}
          <span className="list-department"> · {employee.department}</span>
        </p>
      </div>
      <div className="card-contacts">
        {employee.email && (
          <a href={`mailto:${employee.email}`}>
            <Mail size={15} />
            <span>{employee.email}</span>
          </a>
        )}
        {employee.location && (
          <span>
            <MapPin size={15} />
            {employee.location}
          </span>
        )}
      </div>
      <button
        className="card-profile"
        onClick={() => onOpen(employee)}
        aria-label={`Открыть профиль: ${employee.fullName}`}
      >
        <span>Профиль сотрудника</span>
        <span className="profile-arrow">
          <ArrowUpRight size={18} />
        </span>
      </button>
    </article>
  );
}
