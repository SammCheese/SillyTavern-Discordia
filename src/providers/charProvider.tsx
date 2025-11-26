import React from "react";


export const CharContext = React.createContext<{ characterId: number | string | undefined }>({ characterId: undefined });

export function CharProvider({ children }: { children: React.ReactNode }) {
  const [characterId, setCharacterId] = React.useState<number | string | undefined>(undefined);

  return (
    <CharContext.Provider value={{ characterId }}>
      {children}
    </CharContext.Provider>
  );
}
