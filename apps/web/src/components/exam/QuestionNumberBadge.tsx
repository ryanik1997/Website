import type { MouseEvent } from 'react';
import './questionNumberBadge.css';

export type QuestionNumberBadgeState =
  | 'unanswered'
  | 'answered'
  | 'current'
  | 'disabled'
  | 'correct'
  | 'incorrect';

export interface QuestionNumberBadgeProps {
  number: number;
  state?: QuestionNumberBadgeState;
  bookmarked?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

export function QuestionNumberBadge({
  number,
  state = 'unanswered',
  bookmarked = false,
  disabled = false,
  onClick,
  ariaLabel,
  className,
}: QuestionNumberBadgeProps) {
  const digits = number >= 100 ? '3' : undefined;
  const classes = ['exam-question-number-badge', className]
    .filter(Boolean)
    .join(' ');

  const handleClick = (_e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <button
      type="button"
      className={classes}
      data-question-number-badge="true"
      data-state={state}
      data-bookmarked={bookmarked ? 'true' : 'false'}
      data-digits={digits}
      disabled={disabled}
      aria-label={ariaLabel ?? `Go to question ${number}`}
      aria-current={state === 'current' ? 'step' : undefined}
      onClick={handleClick}
    >
      <span className="exam-question-number-badge__label">{number}</span>
      {bookmarked ? (
        <span
          className="exam-question-number-badge__bookmark"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}
