
import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import Chat from "./Chat";
interface UserProfile {
  id: number
  fullName: string
  email: string
  bio: string
  skills: string
}

const API_URL = 'http://localhost:8080/api/profiles'

function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadProfiles() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`Could not load profiles (${response.status})`)
      }

      const data: UserProfile[] = await response.json()
      setProfiles(data)
    } catch {
      setError('Backend connect होत नाही. Spring Boot सुरू आहे का ते तपासा.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfiles()
  }, [])

  const filteredProfiles = profiles.filter((profile) => {
    const search = searchTerm.trim().toLowerCase()

    return (
        (profile.fullName || '').toLowerCase().includes(search) ||
        (profile.email || '').toLowerCase().includes(search) ||
        (profile.skills || '').toLowerCase().includes(search) ||
        (profile.bio || '').toLowerCase().includes(search)
    )
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const newProfile = {
      fullName: fullName.trim(),
      email: email.trim(),
      bio: bio.trim(),
      skills: skills.trim(),
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfile),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Request failed (${response.status})`)
      }

      setFullName('')
      setEmail('')
      setBio('')
      setSkills('')
      setSuccess('Profile successfully created!')
      await loadProfiles()
    } catch (err) {
      setError(
          err instanceof Error
              ? `Profile save झाले नाही: ${err.message}`
              : 'Profile save करताना error आला.',
      )
    } finally {
      setSaving(false)
    }
  }

  const totalSkills = profiles.reduce((total, profile) => {
    return (
        total +
        (profile.skills
            ? profile.skills.split(',').filter((skill) => skill.trim()).length
            : 0)
    )
  }, 0)

  return (
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="#home">
            <span className="brand-icon">S</span>
            <span>
            SkillCircle<span className="brand-dot">.</span>
          </span>
          </a>

          <p className="nav-label">WORKSPACE</p>

          <a className="nav-item active" href="#home">
            <span>⌂</span> Dashboard
          </a>

          <a className="nav-item" href="#create-profile">
            <span>＋</span> Create Profile
          </a>

          <a className="nav-item" href="#community">
            <span>◎</span> Community
          </a>

          <div className="sidebar-bottom">
            <div className="sidebar-avatar">SC</div>
            <div>
              <strong>SkillCircle AI</strong>
              <p>Skill up together</p>
            </div>
          </div>
        </aside>

        <main className="main-content" id="home">
          <header className="topbar">
            <div>
              <p className="eyebrow">YOUR LEARNING SPACE</p>
              <h1>
                Dashboard <span className="wave">✦</span>
              </h1>
            </div>

            <a className="topbar-button" href="#create-profile">
              + Create profile
            </a>
          </header>

          <section className="welcome-banner">
            <div className="welcome-copy">
              <span className="welcome-tag">WELCOME TO SKILLCIRCLE</span>

              <h2>
                Great skills grow
                <br />
                better <span>together.</span>
              </h2>

              <p>
                Share what you know, discover new skills, and connect
                with people who love learning.
              </p>

              <a href="#create-profile" className="primary-button">
                Build your profile <span>→</span>
              </a>
            </div>

            <div className="welcome-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="art-center">SC</div>
              <span className="float-card float-one">✦ Learn</span>
              <span className="float-card float-two">↗ Grow</span>
              <span className="float-card float-three">◎ Share</span>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon purple">♙</div>
              <p>Total profiles</p>
              <h3>{loading ? '—' : profiles.length}</h3>
              <span className="stat-note">Community members</span>
            </article>

            <article className="stat-card">
              <div className="stat-icon orange">✦</div>
              <p>Skills listed</p>
              <h3>{totalSkills}</h3>
              <span className="stat-note">Across all profiles</span>
            </article>

            <article className="stat-card">
              <div className="stat-icon green">✓</div>
              <p>Platform status</p>
              <h3 className="status-text">
                {error.startsWith('Backend connect')
                    ? 'Offline'
                    : loading
                        ? 'Checking'
                        : 'Ready'}
              </h3>
              <span className="stat-note">API connection status</span>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel form-panel" id="create-profile">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">GET STARTED</p>
                  <h2>Create your profile</h2>
                  <p className="panel-description">
                    Introduce yourself to the SkillCircle community.
                  </p>
                </div>
                <span className="heading-icon">✎</span>
              </div>

              <form onSubmit={handleSubmit}>
                <label htmlFor="fullName">Full name</label>
                <input
                    id="fullName"
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    maxLength={100}
                />

                <label htmlFor="email">Email address</label>
                <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={150}
                />

                <label htmlFor="bio">About you</label>
                <textarea
                    id="bio"
                    placeholder="Tell the community what you're passionate about..."
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={3}
                    maxLength={500}
                />

                <label htmlFor="skills">Your skills</label>
                <input
                    id="skills"
                    type="text"
                    placeholder="Java, React, SQL (comma-separated)"
                    value={skills}
                    onChange={(event) => setSkills(event.target.value)}
                    required
                    maxLength={300}
                />

                <p className="input-hint">
                  Separate multiple skills with commas.
                </p>

                {error && (
                    <p className="feedback error-message">{error}</p>
                )}

                {success && (
                    <p className="feedback success-message">{success}</p>
                )}

                <button
                    className="submit-button"
                    type="submit"
                    disabled={saving}
                >
                  {saving ? 'Saving profile...' : 'Create profile →'}
                </button>
              </form>
            </article>

            <article className="panel profiles-panel" id="community">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">MEET THE COMMUNITY</p>
                  <h2>Member profiles</h2>
                  <p className="panel-description">
                    Discover people and the skills they share.
                  </p>
                </div>

                <button
                    className="refresh-button"
                    type="button"
                    onClick={() => void loadProfiles()}
                    title="Refresh profiles"
                    aria-label="Refresh profiles"
                    disabled={loading}
                >
                  ↻
                </button>
              </div>

              <div className="member-search-wrapper">
                <div className="member-search">
                <span className="search-icon" aria-hidden="true">
                  <svg
                      viewBox="0 0 24 24"
                      width="21"
                      height="21"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                  >
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>
                </span>

                  <input
                      type="search"
                      aria-label="Search community members"
                      placeholder="Search people, skills, email..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                  />

                  {searchTerm ? (
                      <button
                          className="clear-search"
                          type="button"
                          onClick={() => setSearchTerm('')}
                          aria-label="Clear search"
                          title="Clear search"
                      >
                        ×
                      </button>
                  ) : (
                      <span className="search-shortcut">SEARCH</span>
                  )}
                </div>
              </div>

              <p className="search-result-count">
                {loading
                    ? 'Loading members...'
                    : `${filteredProfiles.length} ${
                        filteredProfiles.length === 1 ? 'member' : 'members'
                    } found`}
              </p>

              {loading ? (
                  <div className="empty-state">
                    <span className="empty-icon">◌</span>
                    <h3>Loading profiles...</h3>
                    <p>Connecting to your community.</p>
                  </div>
              ) : profiles.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">♧</span>
                    <h3>No profiles yet</h3>
                    <p>Be the first to introduce yourself!</p>
                    <a href="#create-profile">Create the first profile →</a>
                  </div>
              ) : filteredProfiles.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">⌕</span>
                    <h3>No matching members</h3>
                    <p>Try another name, email or skill.</p>
                    <button
                        className="submit-button"
                        type="button"
                        onClick={() => setSearchTerm('')}
                    >
                      Clear search
                    </button>
                  </div>
              ) : (
                  <div className="profile-list">
                    {filteredProfiles.map((profile) => (
                        <article className="profile-card" key={profile.id}>
                          <div className="profile-avatar">
                            {profile.fullName?.charAt(0).toUpperCase() || '?'}
                          </div>

                          <div className="profile-details">
                            <h3>{profile.fullName}</h3>
                            <p className="profile-email">{profile.email}</p>

                            {profile.bio && (
                                <p className="profile-bio">{profile.bio}</p>
                            )}

                            <div className="skill-tags">
                              {(profile.skills || '')
                                  .split(',')
                                  .map((skill) => skill.trim())
                                  .filter(Boolean)
                                  .map((skill) => (
                                      <span className="skill-tag" key={skill}>
                              {skill}
                            </span>
                                  ))}
                            </div>
                          </div>
                        </article>
                    ))}
                  </div>
              )}
            </article>
          </section>
          <Chat />

          <footer className="footer">
            <span>© 2026 SkillCircle AI</span>
            <span>
            Learn together. Build together. <strong>✦</strong>
          </span>
          </footer>
        </main>
      </div>
  )
}

export default App
