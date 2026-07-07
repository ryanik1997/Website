import RwHighlightText from './RwHighlightText'

export function rwGapTextSegment(
  partId: string,
  passageKey: string,
  segIndex: number,
  value: string,
) {
  return (
    <RwHighlightText
      key={`t-${segIndex}`}
      blockId={`${partId}-${passageKey}-seg-${segIndex}`}
      text={value}
    />
  )
}