import { createBrowserRouter } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
import NewLoginPage from "./pages/NewLoginPage";
import DashboardPage from "./pages/DashboardPage";
import CouncilPage from "./pages/CouncilPage";
import PortfolioPage from "./pages/PortfolioPage";
import PerformancePage from "./pages/PerformancePage";
import SettingsPage from "./pages/SettingsPage";

import OakCoinPage from "./pages/OakCoinPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Layout component for authenticated pages
function PageLayout({ children }) {
  return (
    <div
      style={{
        paddingTop: "64px",
        minHeight: "100vh",
        background: "#000000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <main style={{ flex: 1, marginTop: "40px" }}>{children}</main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    // element: <LoginPage />,
    element: <NewLoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <PageLayout>
        <DashboardPage />
      </PageLayout>
    ),
  },
  {
    path: "/council",
    element: (
      <PageLayout>
        <CouncilPage />
      </PageLayout>
    ),
  },
  {
    path: "/oakcoin",
    element: (
      <PageLayout>
        <OakCoinPage />
      </PageLayout>
    ),
  },
  {
    path: "/portfolio",
    element: (
      <PageLayout>
        <PortfolioPage />
      </PageLayout>
    ),
  },
  {
    path: "/performance",
    element: (
      <PageLayout>
        <PerformancePage />
      </PageLayout>
    ),
  },
  {
    path: "/settings",
    element: (
      <PageLayout>
        <SettingsPage />
      </PageLayout>
    ),
  },
]);
