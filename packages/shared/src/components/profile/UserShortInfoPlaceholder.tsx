import React, { ReactElement } from 'react';
import { PlaceholderList } from '../cards/PlaceholderList';

export interface UserShortInfoPlaceholderProps {
  placeholderAmount: number;
}

const MAX_DISPLAY = 5;

export function UserShortInfoPlaceholder({
  placeholderAmount,
}: UserShortInfoPlaceholderProps): ReactElement {
  const amount =
    placeholderAmount <= MAX_DISPLAY ? placeholderAmount : MAX_DISPLAY;

  return (
    <div className="flex flex-col">
      {Array(amount)
        .fill(0)
        .map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <PlaceholderList key={i} />
        ))}
    </div>
  );
}

export default UserShortInfoPlaceholder;
