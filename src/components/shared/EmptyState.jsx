import React from "react";
import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, actionIcon: ActionIcon, onAction, bare }) {
  const body = (
    <>
      {Icon && <Icon className="w-10 h-10 text-slate-300 mx-auto mb-3" />}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>}
      {actionLabel && (actionTo ? (
        <Link to={actionTo} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26]">
          {ActionIcon && <ActionIcon className="w-4 h-4" />} {actionLabel}
        </Link>
      ) : (
        <button onClick={onAction} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26]">
          {ActionIcon && <ActionIcon className="w-4 h-4" />} {actionLabel}
        </button>
      ))}
    </>
  );
  return bare ? <div className="py-10 text-center">{body}</div> : <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">{body}</div>;
}