import styles from './Projects.module.css'
import { useInView } from '../hooks/useInView'

const projects = [
  {
    title: 'AI Portfolio Assistant',
    year: '2026',
    description:
      'A real-time conversational AI avatar (the one you can chat with on this site!) built with retrieval-augmented generation (RAG) over a vector database, and WebRTC video streaming for near-instant, lifelike video responses.',
    tags: ['FastAPI', 'LangChain', 'PostgreSQL/pgvector', 'WebRTC', 'OpenAI'],
    featured: true,
  },
  {
    title: 'Smart Expense Tracker',
    year: '2026',
    description:
      'An expense management and tracking system that automatically scans receipts using OCR and classifies them into categories using OpenAI API.',
    tags: ['FastAPI', 'PostgreSQL', 'OpenAI API', 'OCR', 'Python'],
    featured: false,
  },
  {
    title: 'Allergen Identification',
    year: '2022',
    description:
      'Mobile app that detects allergens in food products by scanning ingredient lists from photos. Uses image processing and OCR to automatically identify and flag allergens.',
    tags: ['Python', 'Kivy', 'Image Processing', 'OCR'],
    featured: false,
  },
  {
    title: 'Full-Stack Learning Projects',
    year: '2023 – 2024',
    description:
      'A series of hands-on mini-projects built during a self-paced course — each covering a new topic every few weeks, from REST APIs and databases to full React + Node.js apps.',
    tags: ['JavaScript', 'React.js', 'Node.js', 'HTML/CSS'],
    featured: false,
  },
]

const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)

export default function Projects() {
  const [headerRef, headerVisible] = useInView()
  const [gridRef, gridVisible] = useInView()

  return (
    <section id="projects" className={styles.section}>
      <div className={styles.container}>
        <div
          ref={headerRef}
          className={`${styles.header} fade-up ${headerVisible ? 'visible' : ''}`}
        >
          <span className={styles.label}>What I've built</span>
          <h2 className={styles.title}>Projects</h2>
          <p className={styles.subtitle}>A selection of things I've worked on</p>
        </div>
        <div ref={gridRef} className={styles.grid}>
          {projects.map((p, i) => (
            <div
              key={p.title}
              className={`${styles.card} ${p.featured ? styles.featured : ''} fade-up ${gridVisible ? 'visible' : ''}`}
              style={{ '--anim-delay': `${i * 0.12}s` }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.folderIcon}><FolderIcon /></span>
                <span className={styles.year}>{p.year}</span>
              </div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardDesc}>{p.description}</p>
              <div className={styles.tags}>
                {p.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
              {p.featured && (
                <button
                  className={styles.tryButton}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-avatar-chat'))}
                >
                  💬 Try it now
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}