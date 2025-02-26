import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-background-card p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
        <h2 className="text-xl font-bold text-neutral-800 mb-4">{title}</h2>
        <div className="mb-4 text-neutral-800">{children}</div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-neutral-400 hover:bg-primary-hover text-neutral-800 font-bold py-2 px-4 rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-error hover:bg-red-700 text-neutral-400 font-bold py-2 px-4 rounded transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
