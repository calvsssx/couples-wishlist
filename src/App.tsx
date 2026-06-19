import { useState } from 'react'
import { useProfile, useSession } from './lib/auth'
import { supabase } from './lib/supabase'
import { AuthPage } from './pages/AuthPage'
import { PairPage } from './pages/PairPage'
import { MyListPage } from './pages/MyListPage'
import { PartnerListPage } from './pages/PartnerListPage'
import { SettingsPage } from './pages/SettingsPage'
import { HeartIcon, UsersIcon, SettingsIcon } from './components/Icons'

type Tab = 'mine' | 'partner' | 'settings'

function App() {
  const { session, loading: sessionLoading } = useSession()
  const { profile, loading: profileLoading } = useProfile(session?.user.id)
  const [tab, setTab] = useState<Tab>('mine')

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (sessionLoading || (session && profileLoading)) {
    return <div className="center-screen"><p style={{ color: 'var(--text-muted)' }}>Loading…</p></div>
  }

  if (!session) {
    return <AuthPage />
  }

  if (!profile) {
    return <div className="center-screen"><p style={{ color: 'var(--text-muted)' }}>Setting up your account…</p></div>
  }

  if (!profile.partner_id) {
    return <PairPage profile={profile} onSignOut={handleSignOut} />
  }

  return (
    <div className="app-shell">
      {tab === 'mine' && <MyListPage profile={profile} />}
      {tab === 'partner' && <PartnerListPage profile={profile} />}
      {tab === 'settings' && <SettingsPage profile={profile} onSignOut={handleSignOut} />}

      <nav className="tab-bar">
        <button
          className={tab === 'mine' ? 'active' : ''}
          onClick={() => setTab('mine')}
          aria-label="My list"
        >
          <HeartIcon />
          <span>Mine</span>
        </button>
        <button
          className={tab === 'partner' ? 'active' : ''}
          onClick={() => setTab('partner')}
          aria-label="Partner's list"
        >
          <UsersIcon />
          <span>Theirs</span>
        </button>
        <button
          className={tab === 'settings' ? 'active' : ''}
          onClick={() => setTab('settings')}
          aria-label="Settings"
        >
          <SettingsIcon />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  )
}

export default App
