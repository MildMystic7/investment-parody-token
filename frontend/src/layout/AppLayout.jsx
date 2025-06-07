import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import styles from "./AppLayout.module.css";

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Listen for sidebar state changes (we'll implement this communication later if needed)
  // For now, we'll manage the layout spacing based on default sidebar width

  return (
    <div className={styles.appLayout}>
      <Sidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}

export default AppLayout;
