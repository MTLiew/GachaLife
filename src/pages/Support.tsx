import { useState } from 'react'
import emailjs from '@emailjs/browser'

type FormData = {
  from_name: string
  from_email: string
  subject: string
  message: string
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

function Support() {
  const [formData, setFormData] = useState<FormData>({
    from_name: '',
    from_email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formData,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )
      setStatus('success')
      setFormData({ from_name: '', from_email: '', subject: '', message: '' })
    } catch (error) {
      console.error('EmailJS error:', error)
      setStatus('error')
    }
  }

  return (
    <div className="page-container">
      <div className="support-wrapper">
        <div className="support-header">
          <h1>Support</h1>
          <p>Found a bug? Have a feature request? Let us know and we'll get back to you.</p>
        </div>

        {status === 'success' ? (
          <div className="support-success">
            <span>✓</span>
            <h2>Message sent!</h2>
            <p>Thanks for reaching out. We'll get back to you as soon as possible.</p>
            <button className="support-btn" onClick={() => setStatus('idle')}>
              Send another message
            </button>
          </div>
        ) : (
          <form className="support-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="from_name">Name <span className="form-optional">(optional)</span></label>
                <input
                  id="from_name"
                  name="from_name"
                  type="text"
                  placeholder="Your name"
                  value={formData.from_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="from_email">Email <span className="form-optional">(optional)</span></label>
                <input
                  id="from_email"
                  name="from_email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.from_email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Type</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a type...</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Describe your issue or request in detail..."
                value={formData.message}
                onChange={handleChange}
                rows={6}
                required
              />
            </div>

            {status === 'error' && (
              <p className="form-error">Something went wrong. Please try again.</p>
            )}

            <button
              className="support-btn"
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Support