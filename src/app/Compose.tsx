interface ComposeProps {
  components: React.ComponentType<{ children: React.ReactNode }>[];
  children: React.ReactNode;
}

const Compose = ({ components, children }: ComposeProps) => {
  return (
    <>
      {components.reduceRight(
        (acc, Component) => (
          <Component>{acc}</Component>
        ),
        children,
      )}
    </>
  );
};

export default Compose;
