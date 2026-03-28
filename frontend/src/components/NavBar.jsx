import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { label: 'Home',      path: '/home',               icon: '🏠' },
  { label: 'My Score',  path: '/intake',             icon: '📊' },
  { label: 'Routine',   path: '/routine',            icon: '✅' },
  { label: 'Resources', path: '/resources/moderate', icon: '🤝' },
  { label: 'What-If',   path: '/scenario',           icon: '🎛️' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="max-w-2xl mx-auto flex">
        {TABS.map(tab => {
          const active = pathname === tab.path || pathname.startsWith(tab.path + '/')
          return (
            <button
              key={tab.path}
              onClick={() => !tab.comingSoon && navigate(tab.path)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs transition-colors
                ${tab.comingSoon ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${active ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.comingSoon && <span className="text-[9px] text-gray-600">soon</span>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
