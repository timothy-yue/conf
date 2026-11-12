import * as React from "react";

type Props = {
  title: string;
  items: Array<string>;
  onSelect?: (item: string, index: number) => void;
};

export const List = ({ title, items, onSelect }: Props) => {
  const sorted = items
    .toSorted((a, b) => a.localeCompare(b))
    .filter((item) => item.length > 0)
    .map((item) => item.trim());
  return (
    <section className="list" aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {sorted.map((item, index) => (
          <li key={item} onClick={() => onSelect?.(item, index)}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
};
