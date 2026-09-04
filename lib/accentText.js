import { Fragment } from "react";

/**
 * Renders a string with *asterisk-wrapped* spans styled as the italic accent.
 * Used for editable headings ("We design for the *long view*.").
 */
export function accentText(text, accentClass = "italic text-clay") {
  if (!text) return null;
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("*") && part.endsWith("*") ? (
        <span key={i} className={accentClass}>
          {part.slice(1, -1)}
        </span>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      )
    );
}
