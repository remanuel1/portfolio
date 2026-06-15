import styles from './Experience.module.css'
import { useInView } from '../hooks/useInView'

const experiences = [
  {
    role: 'Backend Developer',
    company: 'SmartyApp',
    period: '11/2025 – 05/2026',
    type: 'Work',
    bullets: [
      'Collaborated with a team to build a fully custom WhatsApp bot from the ground up using TypeScript, with complete backend integration with Meta\'s official API.',
      'The bot received Meta\'s official verification and approval.',
      'Analyzed business requirements and contributed to key architectural decisions throughout the project.',
    ],
    tags: ['TypeScript', 'Node.js', 'Meta API', 'Docker'],
  },
  {
    role: 'Backend Development Course',
    company: 'Niv Yitzhaki - Online Course',
    period: '2025',
    type: 'Course',
    description: 'Built REST APIs, managed databases, and learned scalable architecture design.',
    tags: ['Spring Boot', 'Docker', 'Kafka', 'Swagger', 'Python'],
  },
]

const education = [
  {
    degree: 'BSc in Software Engineering',
    institution: 'Jerusalem College of Technology (JCT)',
    period: '2020 – 2023',
    gpa: 'GPA: 90',
    tags: ['Algorithms', 'AI', 'Data Mining', 'Full-Stack'],
  },
]

export default function Experience() {
  const [headerRef, headerVisible] = useInView()
  const [workRef, workVisible] = useInView()
  const [eduRef, eduVisible] = useInView()

  return (
    <section className={styles.section} id="experience">
      <div className={styles.container}>
        <div
          ref={headerRef}
          className={`${styles.header} fade-up ${headerVisible ? 'visible' : ''}`}
        >
          <span className={styles.label}>My journey</span>
          <h2 className={styles.title}>Experience & Education</h2>
        </div>

        <div className={styles.columns}>
          <div ref={workRef} className={styles.column}>
            <h3 className={styles.columnTitle}>Work Experience</h3>
            {experiences.map((exp, i) => (
              <div
                key={i}
                className={`${styles.card} fade-up ${workVisible ? 'visible' : ''}`}
                style={{ '--anim-delay': `${i * 0.1}s` }}
              >
                <div className={styles.cardTop}>
                  <div>
                    <div className={styles.role}>{exp.role}</div>
                    <div className={styles.company}>{exp.company}</div>
                  </div>
                  <span className={styles.period}>{exp.period}</span>
                </div>
                {exp.bullets ? (
                  <ul className={styles.bullets}>
                    {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                ) : (
                  <p className={styles.description}>{exp.description}</p>
                )}
                <div className={styles.tags}>
                  {exp.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>

          <div ref={eduRef} className={styles.column}>
            <h3 className={styles.columnTitle}>Education</h3>
            {education.map((edu, i) => (
              <div
                key={i}
                className={`${styles.card} fade-up ${eduVisible ? 'visible' : ''}`}
                style={{ '--anim-delay': `${i * 0.1}s` }}
              >
                <div className={styles.cardTop}>
                  <div>
                    <div className={styles.role}>{edu.degree}</div>
                    <div className={styles.company}>{edu.institution}</div>
                  </div>
                  <span className={styles.period}>{edu.period}</span>
                </div>
                <div className={styles.gpa}>{edu.gpa}</div>
                <div className={styles.tags}>
                  {edu.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}