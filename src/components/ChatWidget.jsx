import { useState, useRef, useEffect } from 'react'
import styles from './ChatWidget.module.css'
import { useInView } from '../hooks/useInView'

const API_URL = 'http://localhost:8000/query'

export default function ChatWidget() {
  const [headerRef, headerVisible] = useInView()
  const [boxRef, boxVisible] = useInView()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm Renana's AI avatar 👋 Ask me anything about her background, skills, or experience!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { from: 'user', text }])
    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text: text, language: 'English' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error')
      setMessages(prev => [...prev, { from: 'bot', text: data.response }])
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: "Sorry, I'm having trouble connecting right now. Please try again!" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className={styles.section} id="chat">
        <div className={styles.container}>
          <div
            ref={headerRef}
            className={`${styles.header} fade-up ${headerVisible ? 'visible' : ''}`}
          >
            <span className={styles.label}>Powered by RAG + AI</span>
            <h2 className={styles.title}>Chat with My Avatar</h2>
            <p className={styles.subtitle}>Ask me anything about my background, skills, or experience</p>
          </div>
          <div
            ref={boxRef}
            className={`${styles.chatBox} fade-up ${boxVisible ? 'visible' : ''}`}
            style={{ '--anim-delay': '0.15s' }}
          >
            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <div key={i} className={`${styles.message} ${msg.from === 'user' ? styles.user : styles.bot}`}>
                  {msg.from === 'bot' && <div className={styles.avatar}>RF</div>}
                  <div className={styles.bubble}>{msg.text}</div>
                </div>
              ))}
              {loading && (
                <div className={`${styles.message} ${styles.bot}`}>
                  <div className={styles.avatar}>RF</div>
                  <div className={styles.bubble}>
                    <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask something about Renana..."
                disabled={loading}
              />
              <button className={styles.sendBtn} onClick={send} disabled={loading || !input.trim()}>
                Send
              </button>
            </div>
          </div>
        </div>
      </section>

      <button className={styles.fab} onClick={() => setOpen(o => !o)} aria-label="Chat">
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className={styles.floatingChat}>
          <div className={styles.floatingHeader}>
            <div className={styles.floatingAvatar}>RF</div>
            <div>
              <div className={styles.floatingName}>Renana Friedman</div>
              <div className={styles.floatingStatus}>● Online</div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className={styles.floatingMessages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${msg.from === 'user' ? styles.user : styles.bot}`}>
                <div className={styles.bubble}>{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.bubble}>
                  <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button className={styles.sendBtn} onClick={send} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}