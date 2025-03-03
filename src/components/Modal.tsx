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
  // Create a ref for the first focusable element
  const initialFocusRef = React.useRef<HTMLButtonElement>(null);

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    // Focus the cancel button when modal opens
    if (isOpen && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-background-card p-6 rounded-lg shadow-lg w-11/12 md:w-1/3"
        role="document"
      >
        <h2
          id="modal-title"
          className="text-xl font-bold text-neutral-800 mb-4"
        >
          {title}
        </h2>
        <div className="mb-4 text-neutral-800">{children}</div>
        <div className="flex justify-end space-x-4">
          <button
            ref={initialFocusRef}
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
