import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { label: 'Home',      path: '/home',               icon: '🏠' },
  { label: 'My Score',  path: '/score',              icon: '📊' },
  { label: 'Routine',   path: '/routine',            icon: '✅' },
  { label: 'Resources', path: '/resources/moderate', icon: '🤝' },
  { label: 'What-If',   path: '/scenario',           icon: '🎛️' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: '#ffffff', borderTop: '1px solid #e5e5e5', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
      <div className="max-w-2xl mx-auto flex">
        {TABS.map(tab => {
          const active = pathname === tab.path || pathname.startsWith(tab.path + '/')
          return (
            <button
              key={tab.path}
              onClick={() => !tab.comingSoon && navigate(tab.path)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs transition-colors
                ${tab.comingSoon ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ color: active ? '#111111' : '#aaaaaa' }}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className={active ? 'font-semibold' : ''}>{tab.label}</span>
              {tab.comingSoon && <span className="text-[9px]" style={{ color: '#c4a8e0' }}>soon</span>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
