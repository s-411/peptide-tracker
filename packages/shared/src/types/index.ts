export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Peptide {
  id: string;
  userId: string;
  name: string;
  sequence: string;
  createdAt: Date;
  updatedAt: Date;
}