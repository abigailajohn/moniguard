const P = {
  home: 'M4 11 12 4l8 7v9H4z',
  verify: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M9 12l2 2 4-4',
  flag: 'M6 20V4h11l-2 4 2 4H6',
  learn: 'M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3zM21 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z',
  set: 'M4 7h16M4 17h16 M7 7a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M13 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  bld: 'M5 3h10v18H5z M15 9h4v12h-4 M8 7h4M8 11h4M8 15h4',
  bank: 'M3 10 12 4l9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18',
  bell: 'M6 16h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v4zM10 19a2 2 0 0 0 4 0',
  clock: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M12 7v5l3 2',
  lock: 'M5 11h14v9H5z M8 11V8a4 4 0 0 1 8 0v3',
  trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  ch: 'm9 6 6 6-6 6',
  back: 'm15 6-6 6 6 6',
  help: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5M12 17v.1',
  book: 'M6 3h12v18l-6-4-6 4z M9.5 10l2 2 3.5-4',
  doc: 'M7 3h7l4 4v14H7z M10 12h5M10 16h5',
  srch: 'M5 11a6 6 0 1 0 12 0a6 6 0 1 0-12 0 M16 16l4 4',
  warn: 'M12 4 3 20h18z M12 10v4M12 17v.1',
  chk: 'm5 12 5 5 9-10',
  chat: 'M4 5h16v11H9l-5 4z',
  mail: 'M3 5h18v14H3z M3 7l9 6 9-6',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  img: 'M4 5h16v14H4z M7.5 10a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0 M5 18l5-5 4 4 2-2 4 4',
  qr: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h2v2h-2zM18 14h2v6h-4M14 18h2',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8',
  cloud: 'M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.2A3.5 3.5 0 0 1 17 18 M12 12v7M9.5 14.5 12 12l2.5 2.5',
  clipb: 'M6 5h12v16H6z M9 5V3h6v2M9 11h6M9 15h4',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z',
  exc: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M12 7v6M12 16v.1',
  dn: 'm6 9 6 6 6-6',
  up: 'm6 15 6-6 6 6',
  ur: 'M7 17 17 7M9 7h8v8',
  ar: 'M5 12h14M13 6l6 6-6 6',
  globe: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  cc: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M8.5 12.5 11 15l4.5-5',
  shx: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M12 8.5v4M12 15.5v.1',
  shok: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M9 12l2 2 4-4',
  shq: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M10 9.5a2 2 0 1 1 3 1.7c-.6.3-1 .7-1 1.3M12 15.5v.1',
  plus: 'M12 5v14M5 12h14',
}
export default function Icon({ name, size = 22, color = 'currentColor', sw = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}>
      <path d={P[name]} />
    </svg>
  )
}
