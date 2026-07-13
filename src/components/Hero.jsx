import { useEffect, useState, useRef } from 'react'
import styles from './Hero.module.css'

const titles = ['Backend Developer', 'Software Engineering', 'Full-Stack Developer']
const WHATSAPP_NUMBER = '972584979024'

const WhatsAppIcon = ({ size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="#25D366" 
    style={{ flexShrink: 0 }}
  >
    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.977h.004c4.368 0 7.928-3.559 7.93-7.93a7.897 7.897 0 0 0-2.327-5.619ZM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592Zm3.69-4.294c-.202-.101-1.194-.588-1.378-.654-.185-.067-.32-.101-.456.101-.135.202-.524.654-.641.789-.118.135-.236.151-.438.05-2.008-.99-3.301-2.43-3.793-3.279-.117-.202-.012-.311.089-.412.09-.09.202-.236.302-.354.101-.118.135-.2.203-.336.067-.135.034-.252-.017-.354-.05-.101-.456-1.1-.625-1.507-.164-.395-.325-.341-.456-.341-.117-.006-.252-.007-.388-.007a.782.782 0 0 0-.568.264C3.8 4.887 3.09 5.58 3.09 6.97c0 1.392 1.012 2.733 1.153 2.919.143.187 1.987 3.035 4.815 4.254.673.291 1.2.464 1.611.595.676.215 1.29.185 1.777.113.543-.081 1.67-.682 1.904-1.34.234-.657.234-1.22.164-1.34-.07-.12-.252-.186-.453-.287Z"/>
  </svg>
)

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const contactRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contactRef.current && !contactRef.current.contains(e.target)) {
        setContactOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            href="https://www.linkedin.com/in/renanafriedman/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <div className={styles.contactWrap} ref={contactRef}>
            <button
              className={styles.btnSecondary}
              onClick={() => setContactOpen((v) => !v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <WhatsAppIcon /> Contact Me ▾
            </button>
            {contactOpen && (
              <div className={styles.contactMenu}>
                <a
                  className={styles.contactOption}
                  href="mailto:renana@smartyapp.co.il"
                  onClick={() => setContactOpen(false)}
                >
                  ✉️ Email
                </a>
                <a
                  className={styles.contactOption}
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setContactOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <WhatsAppIcon /> WhatsApp
                </a>
              </div>
            )}
          </div>
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