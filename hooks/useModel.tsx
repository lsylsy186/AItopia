import { createContext, useContext } from 'react';
import { useGlobal, useMedia, useElevenlabs, useChat } from './model';

const defaultState = {
  global: {} as any,
  media: {} as any,
  elevenlabs: {} as any,
  chat: {} as any,
};

const ModelContext = createContext(defaultState);

export const ModelContextProvider = ({ children }: any) => {
  const model = {
    global: useGlobal(),
    media: useMedia(),
    elevenlabs: useElevenlabs(),
    chat: useChat(),
  };
  return (
    <ModelContext.Provider value={model}>
      {children}
    </ModelContext.Provider>
  );
};

export const useMyContext = () => useContext(ModelContext);
export const useModel = (ns: keyof typeof defaultState) => {
  const context = useMyContext();
  return context[ns];
}