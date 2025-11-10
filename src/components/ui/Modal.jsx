import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

const Modal = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto w-full mx-4",
        className
      )}>
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children, onClose, className }) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700",
      className
    )}>
      <div>{children}</div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const ModalTitle = ({ children, className }) => {
  return (
    <h2 className={cn(
      "text-xl font-bold text-gray-900 dark:text-white",
      className
    )}>
      {children}
    </h2>
  );
};

const ModalDescription = ({ children, className }) => {
  return (
    <p className={cn(
      "text-sm text-gray-600 dark:text-gray-400 mt-1",
      className
    )}>
      {children}
    </p>
  );
};

const ModalContent = ({ children, className }) => {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
};

const ModalFooter = ({ children, className }) => {
  return (
    <div className={cn(
      "flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50",
      className
    )}>
      {children}
    </div>
  );
};

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter };
