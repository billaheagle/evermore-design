"use client";

import { useEffect, useId, useRef, useState } from "react";

// A select-only combobox (ARIA 1.2 pattern): focus stays on the trigger,
// the active option is tracked with aria-activedescendant. Styled to sit on
// the dark contact section — the native <select> popup could not be.
export default function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = "Choose one",
  id,
}) {
  const reactId = useId();
  const fieldId = id || `select-${reactId}`;
  const listId = `${fieldId}-list`;
  const optionId = (i) => `${fieldId}-opt-${i}`;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const optionRefs = useRef([]);
  const typeahead = useRef({ str: "", at: 0 });

  const selectedIndex = options.indexOf(value);
  const hasValue = selectedIndex >= 0;

  // Close when focus or a click leaves the component.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // On open, highlight the current selection (or the first option).
  useEffect(() => {
    if (open) setActive(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the highlighted option in view.
  useEffect(() => {
    if (open && active >= 0) {
      optionRefs.current[active]?.scrollIntoView({ block: "nearest" });
    }
  }, [open, active]);

  function choose(i) {
    if (options[i] != null) onChange(options[i]);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onKeyDown(e) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((a) => Math.min(a + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((a) => Math.max(a - 1, 0));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open && active >= 0) choose(active);
        else setOpen((o) => !o);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        if (open) setOpen(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now();
          const str =
            now - typeahead.current.at < 600
              ? typeahead.current.str + e.key
              : e.key;
          typeahead.current = { str: str.toLowerCase(), at: now };
          const match = options.findIndex((o) =>
            o.toLowerCase().startsWith(typeahead.current.str)
          );
          if (match >= 0) {
            if (open) setActive(match);
            else onChange(options[match]);
          }
        }
    }
  }

  return (
    <div ref={rootRef} className={`relative ${open ? "z-30" : "z-10"}`}>
      <span id={`${fieldId}-label`} className="block archive-label text-parchment/45">
        {label}
      </span>

      <button
        ref={btnRef}
        type="button"
        id={fieldId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${fieldId}-label ${fieldId}`}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`mt-2 flex w-full items-center justify-between gap-3 border-b bg-transparent py-2 text-left text-sm outline-none transition-colors ${
          open ? "border-parchment/70" : "border-parchment/25 hover:border-parchment/45"
        } ${hasValue ? "text-parchment" : "text-parchment/35"}`}
      >
        <span className="truncate">{hasValue ? value : placeholder}</span>
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`shrink-0 text-parchment/50 transition-transform duration-300 ease-archive ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M3 5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <ul
        id={listId}
        role="listbox"
        aria-labelledby={`${fieldId}-label`}
        className={`absolute left-0 right-0 top-full mt-2 max-h-64 origin-top overflow-auto rounded-xl border border-parchment/15 bg-[#211D17] py-1.5 shadow-deep transition-all duration-200 ease-archive ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}
      >
        {options.map((opt, i) => {
          const isSelected = i === selectedIndex;
          const isActive = i === active;
          return (
            <li
              key={opt}
              id={optionId(i)}
              ref={(el) => (optionRefs.current[i] = el)}
              role="option"
              aria-selected={isSelected}
              onClick={() => choose(i)}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive ? "bg-parchment/[0.07]" : ""
              } ${isSelected ? "text-clay" : "text-parchment/80"}`}
            >
              <span>{opt}</span>
              {isSelected && (
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-clay" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
