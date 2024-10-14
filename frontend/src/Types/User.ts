export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface UserListOverlayProps {
  users: User[];
  onClose: () => void;
}
