import type { CambridgeWritingTask } from '@ryan/catalog'

export default function CambridgeWritingPromptRenderer({
  task,
}: {
  task: CambridgeWritingTask
}) {
  if (!task.promptBlocks?.length) {
    return (
      <div className="cw-prompt-legacy">
        {task.promptText
          ?.split(/\n{2,}/)
          .map((paragraph, index) => <p key={index} className="cw-prompt-paragraph">{paragraph}</p>)}
      </div>
    )
  }

  return (
    <div className="cw-prompt-blocks">
      {task.promptBlocks.map((block) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={block.id} className="cw-prompt-paragraph">{block.text}</p>
          case 'panel':
            return (
              <section key={block.id} className={`cw-prompt-panel cw-prompt-panel--${block.variant}`}>
                {block.heading ? <h3>{block.heading}</h3> : null}
                {block.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                {block.listItems?.length ? (
                  <ul>
                    {block.listItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : null}
                {block.footer ? <p className="cw-prompt-panel__footer">{block.footer}</p> : null}
              </section>
            )
          case 'email':
            return (
              <section key={block.id} className="cw-prompt-email">
                <div className="cw-prompt-email__title">EMAIL</div>
                <dl className="cw-prompt-email__meta">
                  {block.from ? (
                    <div>
                      <dt>From:</dt>
                      <dd>{block.from}</dd>
                    </div>
                  ) : null}
                  {block.subject ? (
                    <div>
                      <dt>Subject:</dt>
                      <dd>{block.subject}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="cw-prompt-email__body">
                  {block.greeting ? <p>{block.greeting}</p> : null}
                  {block.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  {block.closing ? <p>{block.closing}</p> : null}
                  {block.sender ? <p>{block.sender}</p> : null}
                </div>
              </section>
            )
          case 'source-text':
            return (
              <article key={block.id} className="cw-source-text">
                <strong className="cw-source-text__label">{block.label}:</strong>
                {block.title ? <h3 className="cw-source-text__title">{block.title}</h3> : null}
                <p>{block.text}</p>
              </article>
            )
          case 'final-instruction':
            return <p key={block.id} className="cw-final-instruction">{block.text}</p>
        }
      })}
    </div>
  )
}
