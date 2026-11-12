import * as React from "react";

import type { ReactNode } from "react";

interface ButtonProps {
  readonly children: ReactNode;
  readonly onPress?: (pressCount: number) => void;
}

export function Button({ children, onPress }: ButtonProps): React.JSX.Element {
  const [pressCount, setPressCount] = React.useState(0);

  const handleClick = (): void => {
    const next = pressCount + 1;
    setPressCount(next);
    onPress?.(next);
  };

  return (
    <button type="button" onClick={handleClick}>
      {children} ({pressCount})
    </button>
  );
}
