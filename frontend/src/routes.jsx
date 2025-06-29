import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import CouncilPage from "./pages/CouncilPage";
import DashboardPage from "./pages/DashboardPage";
import NewLoginPage from "./pages/NewLoginPage";
import OakCoinPage from "./pages/OakCoinPage";
import PortfolioPage from "./pages/PortfolioPage";
import SettingsPage from "./pages/SettingsPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <NewLoginPage />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    element: <App />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/portfolio",
        element: <PortfolioPage />,
      },
      {
        path: "/council",
        element: <CouncilPage />,
      },
      {
        path: "/oakcoin",
        element: <OakCoinPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
