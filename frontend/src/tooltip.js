import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { isValidElement } from "react";
import { cloneElement } from "react";
import { forwardRef } from "react";
import { Children } from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";

import "./tooltip.css";

const placement = "top";
const delay = 100;

const Tooltip = forwardRef(({ content, children, ...rest }, ref) => {
  // popper elements
  const [target, setTarget] = useState(null);
  const [popper, setPopper] = useState(null);
  const [arrow, setArrow] = useState(null);

  // open state
  const [isOpen, setOpen] = useState(false);

  // open delay timer
  const timer = useRef();

  // open tooltip
  const open = () => {
    // don't open if no content
    if (!content) return;
    window.clearTimeout(timer?.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };

  // close tooltip
  const close = () => {
    window.clearTimeout(timer?.current);
    setOpen(false);
  };

  // popper.js options
  let options = {
    placement,
    modifiers: [
      // https://github.com/popperjs/popper-core/issues/1138
      { name: "computeStyles", options: { adaptive: false } },
      { name: "offset", options: { offset: [0, 10] } },
      { name: "arrow", options: { element: arrow, padding: 10 } },
    ],
  };
  const { styles, attributes, update } = usePopper(target, popper, options);

  useEffect(() => {
    if (update) update();
  }, [content, update]);

  // attach props to child
  if (children) {
    const props = {
      ...rest,
      onMouseEnter: open,
      onMouseLeave: close,
      onFocus: open,
      onBlur: close,
      ref: (el) => {
        setTarget(el);
        return ref;
      },
    };
    children = Children.map(children, (element, index) => {
      if (index > 0) return element;
      if (isValidElement(element)) return cloneElement(element, props);
      return element;
    });
  }

  // attach props to content
  if (isValidElement(content)) {
    const props = {
      onLoad: update,
    };
    content = cloneElement(content, props);
  }

  return (
    <>
      {children}
      {isOpen &&
        createPortal(
          <div
            ref={setPopper}
            className="tooltip"
            style={{ ...styles.popper }}
            {...attributes.popper}
          >
            {typeof content === "string" && (
              <div className="tooltip_content">{content}</div>
            )}
            {typeof content !== "string" && content}
            <div
              ref={setArrow}
              className="tooltip_arrow"
              style={styles.arrow}
            />
          </div>,
          document.body
        )}
    </>
  );
});

export default Tooltip;
