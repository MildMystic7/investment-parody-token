import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CouncilPage from "./pages/CouncilPage";
import PortfolioPage from "./pages/PortfolioPage";
import PerformancePage from "./pages/PerformancePage";
import SettingsPage from "./pages/SettingsPage";
import MemesPage from "./pages/MemesPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Layout component for authenticated pages
function PageLayout({ children }) {
  return (
    <div
      style={{
        paddingTop: "64px",
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
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
    path: "/memes",
    element: (
      <PageLayout>
        <MemesPage />
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
