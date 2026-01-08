import { memo, useCallback, useEffect, useState, type ReactNode } from 'react';
import Button, { ButtonLook } from '../Button/Button';

export interface PopupProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  showButtons?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  maxWidth?: string;
}

const ANIMATION_DURATION = 200; // ms

const Popup = ({
  children,
  title,
  description,
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  showButtons = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  maxWidth = '32rem',
}: PopupProps) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
      onCancel?.();
    }, ANIMATION_DURATION);
  }, [onClose, onCancel]);

  const handleConfirm = useCallback(async () => {
    await onConfirm?.();
    onClose?.();
  }, [onConfirm, onClose]);

  useEffect(() => {
    if (!closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, handleClose]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop) {
      handleClose();
    }
  }, [closeOnBackdrop, handleClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const confirmButtonClass = {
    primary: ButtonLook.PRIMARY,
    danger: ButtonLook.DANGER,
    transparent: ButtonLook.TRANSPARENT,
    success: ButtonLook.SUCCESS,
  }[confirmVariant];

  return (
    <div
      className="absolute inset-0 z-9999 flex items-center justify-center p-4 transition-all duration-200 ease-out"
      style={{
        backgroundColor: isClosing ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.6)',
        backdropFilter: isClosing ? 'blur(0px)' : 'blur(2px)',
        opacity: isClosing ? 0 : 1,
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-base-discordia rounded-lg shadow-xl max-h-[90vh] overflow-auto transition-all duration-200 ease-out"
        style={{
          maxWidth,
          transform: isClosing ? 'scale(0.95)' : 'scale(1)',
          opacity: isClosing ? 0 : 1,
        }}
        onClick={handleContentClick}
      >
        {title && (
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-base-discordia-lighter pb-2">
              {title}
            </h2>
            {description && <p className="mt-2 text-sm">{description}</p>}
          </div>
        )}

        {children && <div className="px-6 py-4">{children}</div>}

        {showButtons && (onConfirm || onCancel) && (
          <div className="px-6 pb-6 pt-2 flex gap-3 justify-end">
            {onCancel && (
              <Button onClick={handleClose} look={ButtonLook.TRANSPARENT}>
                {cancelText}
              </Button>
            )}
            {onConfirm && (
              <Button onClick={handleConfirm} look={confirmButtonClass}>
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Popup);
