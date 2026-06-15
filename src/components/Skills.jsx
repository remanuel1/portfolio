import styles from './Skills.module.css'
import { useInView } from '../hooks/useInView'

const skills = [
  { category: 'Languages', items: ['Java', 'Python', 'JavaScript', 'TypeScript'] },
  { category: 'Frameworks', items: ['Spring Boot', 'Node.js', 'React', 'FastAPI'] },
  { category: 'Databases', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
  { category: 'Tools & DevOps', items: ['Docker', 'Git', 'Kafka', 'Postman'] },
  { category: 'Areas', items: ['REST APIs', 'Backend Architecture', 'AI/ML Basics', 'OOP'] },
]

export default function Skills() {
  const [headerRef, headerVisible] = useInView()
  const [gridRef, gridVisible] = useInView()

  return (
    <section className={styles.section} id="skills">
      <div className={styles.container}>
        <div
          ref={headerRef}
          className={`${styles.header} fade-up ${headerVisible ? 'visible' : ''}`}
        >
          <span className={styles.label}>What I know</span>
          <h2 className={styles.title}>Skills & Technologies</h2>
          <p className={styles.subtitle}>Tools and technologies I work with</p>
        </div>
        <div ref={gridRef} className={styles.grid}>
          {skills.map((group, i) => (
            <div
              key={group.category}
              className={`${styles.card} fade-up ${gridVisible ? 'visible' : ''}`}
              style={{ '--anim-delay': `${i * 0.08}s` }}
            >
              <h3 className={styles.category}>{group.category}</h3>
              <div className={styles.tags}>
                {group.items.map((item) => (
                  <span key={item} className={styles.tag}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}