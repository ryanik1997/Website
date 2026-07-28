export default function ReadingRibbonBackdrop({ ribbons = true }: { ribbons?: boolean }) {
  return (
    <div className={`snb-ribbon-bg${ribbons ? '' : ' is-reader'}`} aria-hidden>
      <div className="snb-ribbon-grid" />
      {ribbons && (
        <>
          <div className="snb-ribbon snb-ribbon--1" />
          <div className="snb-ribbon snb-ribbon--2" />
          <div className="snb-ribbon snb-ribbon--3" />
        </>
      )}
    </div>
  )
}
