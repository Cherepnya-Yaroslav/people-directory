import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import type { Employee } from "../../shared/types";
import { Avatar, Sheet } from "./ui";
import { departmentTone } from "./EmployeeCard";

export function EmployeeDetail({
  employee,
  open,
  onClose,
  onExited,
}: {
  employee: Employee;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}) {
  const joined = employee.joinedAt
    ? new Intl.DateTimeFormat("ru", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${employee.joinedAt}T12:00:00`))
    : "";
  return (
    <Sheet
      title="Профиль сотрудника"
      open={open}
      onClose={onClose}
      onExited={onExited}
    >
      <div className="detail-body">
        <div className="detail-intro">
          <Avatar name={employee.fullName} src={employee.photoUrl} />
          <span
            className={`department-badge ${departmentTone(employee.department)}`}
          >
            <span />
            {employee.department}
          </span>
          <h3>{employee.fullName}</h3>
          <p>{employee.position}</p>
        </div>
        {employee.bio && (
          <section className="detail-section">
            <h4>О коллеге</h4>
            <p>{employee.bio}</p>
          </section>
        )}
        <section className="detail-section">
          <h4>Контакты и информация</h4>
          <dl className="detail-info">
            {employee.email && (
              <div>
                <dt>
                  <Mail size={18} />
                  Email
                </dt>
                <dd>
                  <a href={`mailto:${employee.email}`}>{employee.email}</a>
                </dd>
              </div>
            )}
            {employee.phone && (
              <div>
                <dt>
                  <Phone size={18} />
                  Телефон
                </dt>
                <dd>
                  <a href={`tel:${employee.phone.replace(/[^+\d]/g, "")}`}>
                    {employee.phone}
                  </a>
                </dd>
              </div>
            )}
            {employee.location && (
              <div>
                <dt>
                  <MapPin size={18} />
                  Город
                </dt>
                <dd>{employee.location}</dd>
              </div>
            )}
            {joined && (
              <div>
                <dt>
                  <CalendarDays size={18} />В команде с
                </dt>
                <dd>{joined}</dd>
              </div>
            )}
            {!employee.email &&
              !employee.phone &&
              !employee.location &&
              !joined && <p className="muted">Контакты пока не указаны.</p>}
          </dl>
        </section>
        {employee.email && (
          <a
            className="button primary contact-action"
            href={`mailto:${employee.email}`}
          >
            <Mail size={18} />
            Написать коллеге
          </a>
        )}
      </div>
    </Sheet>
  );
}
