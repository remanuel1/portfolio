import { useEffect, useState, useRef } from 'react'
import styles from './Hero.module.css'

const titles = ['Backend Developer', 'Software Engineering', 'Full-Stack Developer']
const WHATSAPP_NUMBER = '972584979024'

const WhatsAppIcon = ({ size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 448 512" 
    fill="#25D366" 
    style={{ flexShrink: 0 }}
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 496l133.9-35.1c32.7 17.8 69.4 27.2 106.8 27.2 122.4 0 222-99.6 222-222 0-59.3-23.2-115-65.1-157c1.7-1.7 0 0 0 0zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-79.8 20.9 21.3-77.8-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
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
            >
              Contact Me ▾
            </button>
            {contactOpen && (
              <div className={styles.contactMenu}>
                <a
                  className={styles.contactOption}
                  href="mailto:renana@smartyapp.co.il"
                  onClick={() => setContactOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span style={{ fontSize: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', flexShrink: 0 }}>✉️</span> Email
                </a>
                <a
                  className={styles.contactOption}
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setContactOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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