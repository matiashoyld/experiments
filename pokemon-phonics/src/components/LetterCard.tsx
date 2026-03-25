'use client';

import { useLetterCase } from '@/hooks/useLetterCase';

interface LetterCardProps {
  grapheme: string;
  onClick?: () => void;
  selected?: boolean;
  correct?: boolean | null;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export default function LetterCard({
  grapheme,
  onClick,
  selected = false,
  correct = null,
  size = 'medium',
  disabled = false,
}: LetterCardProps) {
  const letterCase = useLetterCase();

  const sizeClass = {
    small: 'letter-card-small',
    medium: 'letter-card-medium',
    large: 'letter-card-large',
  }[size];

  const stateClass = correct === true
    ? 'letter-card-correct'
    : correct === false
    ? 'letter-card-wrong'
    : selected
    ? 'letter-card-selected'
    : '';

  const displayGrapheme = letterCase === 'upper' ? grapheme.toUpperCase() : grapheme.toLowerCase();

  return (
    <button
      className={`letter-card ${sizeClass} ${stateClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Letter ${grapheme}`}
    >
      {displayGrapheme}
    </button>
  );
}
