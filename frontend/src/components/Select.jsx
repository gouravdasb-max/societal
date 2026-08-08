import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function Select({ value, onChange, name, children, style, className }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [open]);
  useEffect(() => {
    const handleClick = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target))
      ) {
        setOpen(false);
      }
    };
    
    let debounce;
    const handleScroll = () => {
      if (open && containerRef.current) {
         clearTimeout(debounce);
         debounce = setTimeout(() => {
             const rect = containerRef.current.getBoundingClientRect();
             setCoords({
               top: rect.bottom + window.scrollY + 8,
               left: rect.left + window.scrollX,
               width: rect.width
             });
         }, 10);
      }
    };

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    }
  }, [open]);
  const options = [];
  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (child.type === "option") {
      options.push({
        value: child.props.value !== undefined ? child.props.value : child.props.children,
        label: child.props.children,
      });
    } else if (Array.isArray(child)) {
      child.forEach((c) => {
        if (c && c.type === "option") {
            options.push({
              value: c.props.value !== undefined ? c.props.value : c.props.children,
              label: c.props.children,
            });
        }
      });
    } else if (child.props && child.props.children && Array.isArray(child.props.children)) {
       child.props.children.forEach((c) => {
        if (c && c.type === "option") {
            options.push({
              value: c.props.value !== undefined ? c.props.value : c.props.children,
              label: c.props.children,
            });
        }
       })
    }
  });

  const selectedOption = options.find((o) => String(o.value) === String(value)) || options[0];

  const handleSelect = (val) => {
    setOpen(false);
    if (onChange) {
      onChange({ target: { name, value: val } });
    }
  };

  const portalContent = (
    <div 
      className="custom-select-dropdown" 
      ref={dropdownRef}
      style={{ 
        position: "absolute", 
        top: coords.top, 
        left: coords.left, 
        width: coords.width,
        zIndex: 99999 
      }}
    >
      {options.map((opt, i) => (
        <div 
          key={i} 
          className={`custom-select-option ${String(opt.value) === String(value) ? "selected" : ""}`}
          onClick={() => handleSelect(opt.value)}
        >
          {opt.label}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`custom-select ${open ? "open" : ""} ${className || ""}`} style={style} ref={containerRef}>
      <div className="custom-select-trigger" onClick={() => setOpen(!open)}>
        {selectedOption ? selectedOption.label : "Select..."}
      </div>
      {open && typeof document !== 'undefined' && createPortal(portalContent, document.body)}
    </div>
  );
}
