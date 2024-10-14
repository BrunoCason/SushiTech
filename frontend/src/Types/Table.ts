import { Product } from "./Product";

export interface Table {
  id: string;
  number: string;
  products: Product[];
  userId: string;
}

export interface DeleteButtonTableProps {
  tableId: string;
  email: string;
  onTableDeleted: () => void;
}

export interface EditTableFormProps {
  tableId: string;
  currentNumber: string;
  onClose: () => void;
  onTableUpdated: () => void;
}