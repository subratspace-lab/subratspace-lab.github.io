import { Fragment } from "react";

const TODO_PATTERN = /(\[TODO: Subrat to fill[^\]]*\])/;
const IS_TODO = /^\[TODO: Subrat to fill/;

/** Renders content strings, highlighting any "[TODO: Subrat to fill]" markers. */
export function TodoText({ text }: { text: string }) {
  const parts = text.split(TODO_PATTERN);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        IS_TODO.test(part) ? (
          <mark key={i} className="todo">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
