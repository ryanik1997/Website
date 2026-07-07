import RwHighlightText from './RwHighlightText'

interface Props {
  partId: string
  range: string
  text: string
}

export default function RwInstruction({ partId, range, text }: Props) {
  return (
    <div className="ket-rw-instruction">
      <p className="ket-rw-instruction__range">
        <RwHighlightText blockId={`${partId}-instr-range`} text={range} />
      </p>
      {text && (
        <p className="ket-rw-instruction__text">
          <RwHighlightText blockId={`${partId}-instr-text`} text={text} />
        </p>
      )}
    </div>
  )
}