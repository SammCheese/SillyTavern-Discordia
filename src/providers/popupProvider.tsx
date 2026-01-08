import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useBackHandler } from '../hooks/useBackHandler';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import Popup, { type PopupProps } from '../components/common/Popup/Popup';

export const PopupContext = createContext<{
  openPopup: (popup: ReactNode, options?: PopupProps) => void;
  closePopup: () => void;
}>({
  openPopup: () => {},
  closePopup: () => {},
});

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [popupContent, setPopupContent] = useState<ReactNode>(null);
  const [popupOptions, setPopupOptions] = useState<PopupProps>({});

  const closePopup = useCallback(() => {
    setIsVisible(false);
    setPopupContent(null);
  }, [setIsVisible, setPopupContent]);

  const openPopup = useCallback(
    (popup: ReactNode, options?: PopupProps) => {
      setIsVisible(true);
      setPopupContent(popup);
      setPopupOptions(options || {});
    },
    [setIsVisible, setPopupContent, setPopupOptions],
  );

  const handleClose = useCallback(() => {
    if (popupOptions.onClose) {
      popupOptions.onClose();
    }
    closePopup();
  }, [popupOptions, closePopup]);

  useBackHandler(isVisible, handleClose);

  return (
    <ErrorBoundary>
      <PopupContext.Provider value={{ openPopup, closePopup }}>
        {isVisible &&
          createPortal(
            <Popup {...popupOptions} onClose={handleClose}>
              {popupContent}
            </Popup>,
            document.body,
          )}
        {children}
      </PopupContext.Provider>
    </ErrorBoundary>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};
