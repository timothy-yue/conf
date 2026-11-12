"use client";

// Directives and comments may sit above the React import; nothing else may.
import * as React from "react";

import { Button } from "./Button";

export function ClientCounter(): React.JSX.Element {
  const [total, setTotal] = React.useState(0);

  return <Button onPress={setTotal}>{`Pressed ${total} times`}</Button>;
}
