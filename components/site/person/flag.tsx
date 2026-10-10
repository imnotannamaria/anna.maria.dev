export function Flag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 100" className={className} aria-hidden focusable="false">
      <rect width="150" height="100" rx="6" fill="#ffffff" />
      <path d="M0 6a6 6 0 0 1 6-6h138a6 6 0 0 1 6 6v61H0z" fill="#0b3d91" />
      <g fill="none" strokeWidth="5">
        <path d="M41 62a34 34 0 0 1 68 0" stroke="#d62828" />
        <path d="M46 62a29 29 0 0 1 58 0" stroke="#f6c21c" />
        <path d="M51 62a24 24 0 0 1 48 0" stroke="#2a9d4a" />
      </g>
      <polygon
        points="75.0,7.0 76.9,12.4 82.6,12.5 78.0,16.0 79.7,21.5 75.0,18.2 70.3,21.5 72.0,16.0 67.4,12.5 73.1,12.4"
        fill="#f6c21c"
      />
      <circle cx="75" cy="52" r="7" fill="#f6c21c" />
      <path
        d="M84.5 52.0L88.0 52.0M83.2 56.8L86.3 58.5M79.8 60.2L81.5 63.3M75.0 61.5L75.0 65.0M70.2 60.2L68.5 63.3M66.8 56.8L63.7 58.5M65.5 52.0L62.0 52.0M66.8 47.2L63.7 45.5M70.2 43.8L68.5 40.7M75.0 42.5L75.0 39.0M79.8 43.8L81.5 40.7M83.2 47.2L86.3 45.5"
        stroke="#f6c21c"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M75 72v22M67 80h16" stroke="#d62828" strokeWidth="5" />
    </svg>
  )
}
