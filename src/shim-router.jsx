import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

const Ctx = createContext(null)

function parse() {
  return { pathname: window.location.pathname, search: window.location.search }
}

export function BrowserRouter({ children }) {
  const [loc, setLoc] = useState(parse)
  useEffect(() => {
    const on = () => setLoc(parse())
    window.addEventListener("popstate", on)
    return () => window.removeEventListener("popstate", on)
  }, [])
  const nav = (to, opts) => {
    if (opts && opts.replace) window.history.replaceState(null, "", to)
    else window.history.pushState(null, "", to)
    setLoc(parse())
  }
  const value = useMemo(() => ({ loc, nav }), [loc])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

function matchPath(pattern, pathname) {
  if (pattern === "*") return { params: {}, rest: true }
  const pSeg = pattern.split("/").filter(Boolean)
  const uSeg = pathname.split("/").filter(Boolean)
  if (pSeg.length !== uSeg.length) return null
  const params = {}
  for (let i = 0; i < pSeg.length; i++) {
    if (pSeg[i].startsWith(":")) params[pSeg[i].slice(1)] = decodeURIComponent(uSeg[i])
    else if (pSeg[i] !== uSeg[i]) return null
  }
  return { params }
}

export function Routes({ children }) {
  const { loc } = useContext(Ctx)
  const list = React.Children.toArray(children)
  for (const child of list) {
    const m = matchPath(child.props.path, loc.pathname)
    if (m) {
      return <ParamCtx.Provider value={m.params}>{child.props.element}</ParamCtx.Provider>
    }
  }
  return null
}

export function Route() { return null }

const ParamCtx = createContext({})

export function Navigate({ to, replace }) {
  const { nav } = useContext(Ctx)
  useEffect(() => { nav(to, { replace }) }, [to])
  return null
}

export function Link({ to, className, children, style }) {
  const { nav } = useContext(Ctx)
  return <a href={to} className={className} style={style} onClick={(e) => { e.preventDefault(); nav(to) }}>{children}</a>
}

export function NavLink({ to, className, children }) {
  return <Link to={to} className={className}>{children}</Link>
}

export function useNavigate() {
  return useContext(Ctx).nav
}
export function useParams() {
  return useContext(ParamCtx)
}
export function useSearchParams() {
  const { loc, nav } = useContext(Ctx)
  const sp = new URLSearchParams(loc.search)
  const set = (next) => {
    const q = typeof next === "string" ? next : new URLSearchParams(next).toString()
    nav(loc.pathname + (q ? "?" + q : ""))
  }
  return [sp, set]
}
export function useLocation() {
  return useContext(Ctx).loc
}
