import { useState, useCallback } from "react";
import ConfirmationModal from "../../components/dashboard/ConfirmationModal";

interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const useConfirmation = () => {
  const [config, setConfig] = useState<ConfirmationConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null
  );

  const confirm = useCallback(
    (config: ConfirmationConfig): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfig(config);
        setIsOpen(true);
        setResolver(() => resolve);
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolver?.(true);
    setResolver(null);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolver?.(false);
    setResolver(null);
  }, [resolver]);

  const ConfirmationComponent = useCallback(() => {
    if (!config) return null;

    return (
      <ConfirmationModal
        isOpen={isOpen}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        variant={config.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }, [config, isOpen, handleConfirm, handleCancel]);

  return { confirm, ConfirmationComponent };
};
