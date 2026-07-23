export default function TidSunMascot() {
  return (
    <div className="tid-sun" aria-hidden="true">
      <img className="tid-sun__body" src="/mascots/tid/sun-body.svg" alt="" />
      <img className="tid-sun__face" src="/mascots/tid/sun-face.svg" alt="" />
      <span className="tid-sun__eyes">
        <span className="tid-sun__eye tid-sun__eye--left" />
        <span className="tid-sun__eye tid-sun__eye--right" />
      </span>
    </div>
  )
}
