import { FaCheckCircle } from "react-icons/fa";

interface ModalConfirmationProps {
  message: string;
}

const ModalConfirmation = ({ message }: ModalConfirmationProps) => {
  return (
    <div className="fixed">
      <div className="bg-white rounded-md border border-FA958 flex items-center h-14 w-48">
        <FaCheckCircle className="text-FA958 h-6 w-6 ml-3" />
        <p className="font-inter font-semibold text-sm ml-6 text-FA958 mr-2">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ModalConfirmation;
