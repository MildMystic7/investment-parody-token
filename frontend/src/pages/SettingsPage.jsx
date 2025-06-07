import styles from "./SettingsPage.module.css";

function SettingsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account preferences and application settings</p>
      </div>

      <div className={styles.content}>
        <div className={styles.comingSoon}>
          <h2>⚙️ Coming Soon</h2>
          <p>
            Settings will allow you to customize your experience, manage
            notifications, and configure trading preferences.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
