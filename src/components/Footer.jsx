import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>© 2026 Renana Friedman</span>
        <div className={styles.links}>
          <a
            href="https://github.com/remanuel1"
            target="_blank"
            rel="noreferrer"
            className={styles.link}
          >
            GitHub
          </a>
          <a href="mailto:renana@smartyapp.co.il" className={styles.link}>
            Email
          </a>
        </div>
      </div>
    </footer>
  )
}