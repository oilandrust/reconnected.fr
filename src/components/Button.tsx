interface ButtonProps {
  href: string
  children: React.ReactNode
}

export function Button({ href, children }: ButtonProps) {
  return (
    <a className="button" href={href}>
      {children}
    </a>
  )
}

interface ButtonGroupProps {
  children: React.ReactNode
  align?: 'center' | 'right'
}

export function ButtonGroup({ children, align = 'center' }: ButtonGroupProps) {
  const alignClass = align === 'right' ? 'buttons-right' : 'buttons-center'
  return <div className={`buttons ${alignClass}`}>{children}</div>
}
