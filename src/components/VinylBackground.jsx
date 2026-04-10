// Purely decorative ambient vinyl discs — fixed, behind all content, no interaction

const DISCS = [
  {
    size: 420,
    style: { top: '-100px', right: '-80px' },
    cover: '/albums/nct-127/nct127-sticker.jpg',
  },
  {
    size: 360,
    style: { top: '40%', left: '-120px' },
    cover: '/albums/nct-127/nct127-neo-zone.jpg',
  },
  {
    size: 300,
    style: { bottom: '10%', right: '5%' },
    cover: '/albums/nct-dream/nctdream-hot-sauce.jpg',
  },
  {
    size: 480,
    style: { top: '70%', left: '30%' },
    cover: '/albums/nct-127/nct127-regular-irregular.jpg',
  },
  {
    size: 260,
    style: { bottom: '-80px', left: '-60px' },
    cover: '/albums/nct-dream/nctdream-glitch-mode.jpg',
  },
]

function VinylDisc({ size, style, cover }) {
  const cx = size / 2
  const cy = size / 2
  const outerR = size / 2 - 1
  const labelR = 40         // centre label radius (80px diameter)
  const grooveSpacing = 6
  const clipId = `clip-${cover.replace(/[^a-z0-9]/gi, '')}`

  // Build concentric groove circles from outerR inward, stopping before label
  const grooves = []
  for (let r = outerR; r > labelR + grooveSpacing; r -= grooveSpacing) {
    grooves.push(r)
  }

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 0,
        width: size,
        height: size,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={cx} cy={cy} r={labelR} />
          </clipPath>
        </defs>

        {/* Disc fill */}
        <circle cx={cx} cy={cy} r={outerR} fill="rgba(255,255,255,0.04)" />

        {/* Grooves */}
        {grooves.map((r) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />
        ))}

        {/* Centre label — album cover, very faint */}
        <image
          href={cover}
          x={cx - labelR}
          y={cy - labelR}
          width={labelR * 2}
          height={labelR * 2}
          opacity="0.12"
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* Centre spindle hole */}
        <circle cx={cx} cy={cy} r={4} fill="rgba(0,0,0,0.6)" />
      </svg>
    </div>
  )
}

export default function VinylBackground() {
  return (
    <>
      {DISCS.map((d, i) => (
        <VinylDisc key={i} {...d} />
      ))}
    </>
  )
}
