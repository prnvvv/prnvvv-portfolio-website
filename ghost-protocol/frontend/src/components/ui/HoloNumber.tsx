import './HoloStats.css'

interface HoloNumberProps {
  value: number
}

export function HoloNumber({ value }: HoloNumberProps) {
  const text = String(value)
  return (
    <div className="holo-card">
      <div className="holo-card__wrapper">
        <span className="holo-card__layer holo-card__layer--back">{text}</span>
        <span className="holo-card__layer holo-card__layer--mid">{text}</span>
        <span className="holo-card__layer holo-card__layer--front">{text}</span>
      </div>
    </div>
  )
}
