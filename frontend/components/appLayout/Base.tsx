import { FC, createContext, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import ThemeProvider from "@/lib/hooks/useThemeSwitcher";
import AppLayoutHeader from "@/components/appLayout/Header";
import Dialog, { ETKDialogActions } from "@/components/Dialog";
import Snackbars from "@/components/Snackbars";

const AppLayout = createContext(null);

export const useAppLayout = () => useContext(AppLayout);

const AppLayoutBase: FC = ({ children }) => {
  const { t } = useTranslation(["common", "components"]);
  const snackbar = useRef();
  const dialog = useRef<ETKDialogActions>(null);

  return (
    <ThemeProvider>
      <AppLayout.Provider value={{ dialog, snackbar, t }}>
        <AppLayoutHeader />
        {children}
        <Dialog ref={dialog} />
        <Snackbars ref={snackbar} />
      </AppLayout.Provider>
    </ThemeProvider>
  );
};

export default AppLayoutBase;