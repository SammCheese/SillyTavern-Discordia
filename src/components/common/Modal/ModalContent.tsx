interface ModalContentProps {
  children?: React.ReactNode;
}

const ModalContent = ({ children }: ModalContentProps) => {
  return (
    <div className="p-4 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
      {children}
    </div>
  );
};

export default ModalContent;
