export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Employee {
  id: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  photoUrl: string;
  bio: string;
  joinedAt: string;
  createdAt: string;
}

export type EmployeeInput = Omit<Employee, "id" | "createdAt">;
export interface EmployeeList {
  employees: Employee[];
  departments: { name: string; count: number }[];
  total: number;
}
