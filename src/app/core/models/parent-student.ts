import { User } from "./user";

export interface ParentStudent {
  parentId: number;
  parent: User | null;
  studentId: number;
  student: User | null;
}
