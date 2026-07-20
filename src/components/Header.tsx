import { useState } from 'react'

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Hakomi', href: '#hakomi' },
  { label: 'Contact', href: '#contact' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header section-full">
      <div className="container header__inner">
        <p className="site-title">
          <a href="#">(Re)Connected</a>
        </p>

        <button
          className="nav-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            {menuOpen ? (
              <path
                fill="currentColor"
                d="m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z"
              />
            ) : (
              <>
                <rect x="4" y="7.5" width="16" height="1.5" fill="currentColor" />
                <rect x="4" y="15" width="16" height="1.5" fill="currentColor" />
              </>
            )}
          </svg>
        </button>

        <nav>
          <ul className={`nav ${menuOpen ? 'nav--open' : ''}`}>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
