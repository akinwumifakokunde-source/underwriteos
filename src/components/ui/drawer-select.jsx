import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

// Drop-in replacement for <select> that renders a native select on desktop and
// a Vaul drawer picker on mobile. Children must be <option> elements, so existing
// <select> usage works unchanged — only the tag name + import change.
export default function DrawerSelect({
  value,
  onChange,
  children,
  className,
  disabled,
  ...rest
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const options = React.Children.toArray(children)
    .filter((c) => c && c.type === "option")
    .map((c) => ({
      value: c.props.value,
      label: c.props.children,
      disabled: c.props.disabled,
    }));

  const toStr = (v) => (v === undefined ? "" : String(v));
  const selected = options.find((o) => toStr(o.value) === toStr(value));

  if (!isMobile) {
    return (
      <select value={value} onChange={onChange} className={className} disabled={disabled} {...rest}>
        {children}
      </select>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={`${className || ""} text-left flex items-center justify-between ${disabled ? "opacity-50" : ""}`}
      >
        <span className="truncate">{selected ? selected.label : "Select…"}</span>
        <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{rest["aria-label"] || rest.name || "Select an option"}</DrawerTitle>
            <DrawerDescription className="sr-only">Choose an option</DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[50vh] overflow-y-auto px-2 pb-4">
            {options.map((o, i) => {
              const active = toStr(o.value) === toStr(value);
              return (
                <button
                  key={toStr(o.value) || i}
                  type="button"
                  disabled={o.disabled}
                  onClick={() => {
                    onChange({ target: { value: toStr(o.value) } });
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm touch-target ${o.disabled ? "opacity-40" : "hover:bg-slate-100"} ${active ? "text-teal-600 font-medium" : "text-slate-700"}`}
                >
                  <span>{o.label}</span>
                  {active && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}