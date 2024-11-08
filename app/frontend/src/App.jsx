import React from 'react';
import { RawIntlProvider } from 'react-intl';
import { intl } from './i18n';
import { RouterProvider } from 'react-router-dom';
import router from './Routes/AppRoutes';
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <RawIntlProvider value={intl}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </RawIntlProvider>
  );
}

export default App;