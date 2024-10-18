import { User } from "./User";

export interface ChangePasswordFormProps {
  email: string;
  onClose: () => void;
  onPasswordChangeSuccess: () => void;
}

export interface DeleteUserConfirmationProps {
  email: string;
  onClose: () => void;
  onUserDeleted: (email: string) => void;
}

export interface ProfileSettingsFormProps {
  user: User;
}
