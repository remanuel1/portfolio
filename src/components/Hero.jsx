import { useEffect, useState } from 'react'
import styles from './Hero.module.css'

const titles = ['Backend Developer', 'Software Engineering', 'Full-Stack Developer']

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = titles[titleIndex]
    if (!deleting && displayed.length < current.length) {
      const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80)
      return () => clearTimeout(t)
    }
    if (!deleting && displayed.length === current.length) {
      const t = setTimeout(() => setDeleting(true), 2000)
      return () => clearTimeout(t)
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40)
      return () => clearTimeout(t)
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false)
      setTitleIndex((titleIndex + 1) % titles.length)
    }
  }, [displayed, deleting, titleIndex])

  const scrollToChat = () => {
    window.dispatchEvent(new CustomEvent('open-avatar-chat'))
  }

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.bg}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.grid} />
      </div>
      <div className={styles.content}>
        <div className={styles.badge}>Available for opportunities</div>
        <h1 className={styles.name}>
          Hi, I'm <span className={styles.accent}>Renana Friedman</span>
        </h1>
        <div className={styles.titleRow}>
          <span className={styles.titleText}>{displayed}</span>
          <span className={styles.cursor}>|</span>
        </div>
        <p className={styles.description}>
          Backend developer passionate about building scalable systems,
          clean architecture, and leveraging AI to create meaningful products.
        </p>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={scrollToChat}>
            Chat with my Avatar
          </button>
          <a
            className={styles.btnSecondary}
            href="https://github.com/remanuel1"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            className={styles.btnSecondary}
            href="mailto:renana@smartyapp.co.il"
          >
            Contact Me
          </a>
          <a
            className={styles.btnSecondary}
            href="/CV%20Renana%20Friedman%20-%20software%20engineering.pdf"
            download
          >
            Download CV
          </a>
        </div>
      </div>
    </section>
  )
}