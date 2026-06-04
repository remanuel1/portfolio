import styles from './Skills.module.css'

const skills = [
  { category: 'Languages', items: ['Java', 'Python', 'JavaScript', 'TypeScript'] },
  { category: 'Frameworks', items: ['Spring Boot', 'Node.js', 'React', 'FastAPI'] },
  { category: 'Databases', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
  { category: 'Tools & DevOps', items: ['Docker', 'Git', 'Kafka', 'Postman'] },
  { category: 'Areas', items: ['REST APIs', 'Backend Architecture', 'AI/ML Basics', 'OOP'] },
]

export default function Skills() {
  return (
    <section className={styles.section} id="skills">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>What I know</span>
          <h2 className={styles.title}>Skills & Technologies</h2>
          <p className={styles.subtitle}>Tools and technologies I work with</p>
        </div>
        <div className={styles.grid}>
          {skills.map((group) => (
            <div key={group.category} className={styles.card}>
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