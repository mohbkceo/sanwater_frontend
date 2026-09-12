import React, { useEffect, useMemo, useState } from "react";

import { contentAPI } from "@/services/baseAPIs";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/configs/permissions";

import { Plus, Search, RefreshCw } from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_FORM = {
  title: "",
  location: "",
  type: "",
  description: "",
  requirementsText: "",
  benefitsText: "",
  status: "draft",
  publishDate: "",
};

const STATUS_META = {
  published: {
    label: "Published",
    className: "border-blue-100 bg-blue-50 text-blue-700",
  },

  draft: {
    label: "Draft",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },

  closed: {
    label: "Closed",
    className: "border-blue-100 bg-blue-100/60 text-blue-800",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function splitLines(value = "") {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/* =========================================================
   FORM COMPONENTS
========================================================= */

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-800">
      {children}

      {required && <span className="ml-1 text-blue-600">*</span>}
    </label>
  );
}

function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`
        h-11
        w-full
        rounded-xl
        border
        border-slate-200
        bg-slate-50/60
        px-3.5
        text-sm
        text-slate-900
        outline-none
        transition
        placeholder:text-slate-400
        focus:border-blue-400
        focus:bg-white
        focus:ring-4
        focus:ring-blue-500/10
        disabled:cursor-not-allowed
        disabled:bg-slate-100
        disabled:text-slate-400
        ${className}
      `}
    />
  );
}

function TextArea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`
        w-full
        resize-y
        rounded-xl
        border
        border-slate-200
        bg-slate-50/60
        px-3.5
        py-3
        text-sm
        leading-6
        text-slate-900
        outline-none
        transition
        placeholder:text-slate-400
        focus:border-blue-400
        focus:bg-white
        focus:ring-4
        focus:ring-blue-500/10
        ${className}
      `}
    />
  );
}

function Select({ className = "", ...props }) {
  return (
    <select
      {...props}
      className={`
        h-11
        w-full
        rounded-xl
        border
        border-slate-200
        bg-slate-50/60
        px-3.5
        text-sm
        text-slate-900
        outline-none
        transition
        focus:border-blue-400
        focus:bg-white
        focus:ring-4
        focus:ring-blue-500/10
        ${className}
      `}
    />
  );
}

/* =========================================================
   MODAL / SHEET
========================================================= */

function Modal({
  open,
  title,
  subtitle,
  children,
  onClose,
  widthClass = "max-w-4xl",
}) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/35
        px-4
        py-5
        backdrop-blur-md
        sm:py-8
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`
          flex
          max-h-[92vh]
          w-full
          ${widthClass}
          flex-col
          overflow-hidden
          rounded-[28px]
          border
          border-white/80
          bg-white/95
          backdrop-blur-2xl
          shadow-xs
        `}
      >
        {/* Header */}
        <div
          className="
            shrink-0
            border-b
            border-slate-100
            bg-white/80
            px-5
            py-4
            backdrop-blur-xl
            sm:px-6
          "
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                Hiring
              </p>

              <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-950">
                {title}
              </h2>

              {subtitle && (
                <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                shrink-0
                rounded-xl
                px-3
                py-2
                text-xs
                font-medium
                text-slate-500
                transition
                hover:bg-blue-50
                hover:text-blue-700
              "
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function StatCard({ label, value, active = false }) {
  return (
    <div
      className={`
        rounded-2xl
        border
        px-4
        py-4
        ${
          active
            ? "border-blue-100 bg-blue-50/70"
            : "border-slate-200/70 bg-white"
        }
      `}
    >
      <p
        className={`
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.12em]
          ${active ? "text-blue-600" : "text-slate-400"}
        `}
      >
        {label}
      </p>

      <p
        className={`
          mt-2
          text-2xl
          font-semibold
          tracking-tight
          ${active ? "text-blue-700" : "text-slate-950"}
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   HIRING CARD
========================================================= */

function HiringCard({ item, onEdit, onDelete, onPreview, canManage = true }) {
  const meta = STATUS_META[item.status] || STATUS_META.draft;

  const requirements = item.requirements || [];

  return (
    <article
      className="
        group
        rounded-[24px]
        border
        border-slate-200/70
        bg-white
        p-5
        transition
        duration-200
        hover:border-blue-200
      "
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className={`
              inline-flex
              rounded-full
              border
              px-2.5
              py-1
              text-[10px]
              font-semibold
              ${meta.className}
            `}
          >
            {meta.label}
          </span>

          <h3 className="mt-3 line-clamp-2 text-lg font-semibold tracking-tight text-slate-950">
            {item.title || "Untitled position"}
          </h3>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>{item.location || "Location not specified"}</span>

            <span className="text-slate-300">·</span>

            <span>{item.type || "Type not specified"}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onPreview(item)}
          className="
            shrink-0
            rounded-xl
            border
            border-slate-200
            bg-white
            px-3
            py-2
            text-xs
            font-medium
            text-slate-600
            transition
            hover:border-blue-100
            hover:bg-blue-50
            hover:text-blue-700
          "
        >
          Preview
        </button>
      </div>

      {/* Description */}
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
        {item.description || "No description provided."}
      </p>

      {/* Requirements */}
      {requirements.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {requirements.slice(0, 3).map((requirement, index) => (
            <span
              key={`${requirement}-${index}`}
              className="
                  max-w-full
                  truncate
                  rounded-full
                  bg-slate-50
                  px-2.5
                  py-1
                  text-[10px]
                  font-medium
                  text-slate-500
                "
            >
              {requirement}
            </span>
          ))}

          {requirements.length > 3 && (
            <span
              className="
                rounded-full
                bg-blue-50
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-blue-600
              "
            >
              +{requirements.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className="
          mt-5
          flex
          flex-col
          gap-3
          border-t
          border-slate-100
          pt-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="text-[11px] text-slate-400">
          Published{" "}
          <span className="font-medium text-slate-600">
            {formatDate(item.publishDate)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            disabled={!canManage}
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-xs
              font-medium
              text-slate-600
              transition
              hover:border-blue-100
              hover:bg-blue-50
              hover:text-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            disabled={!canManage}
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-xs
              font-medium
              text-slate-500
              transition
              hover:border-red-100
              hover:bg-red-50
              hover:text-red-600
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ onCreate, hasFilters, canManage }) {
  return (
    <div
      className="
        flex
        min-h-[360px]
        flex-col
        items-center
        justify-center
        px-6
        py-12
        text-center
      "
    >
      <div
        className="
          rounded-full
          bg-blue-50
          px-4
          py-2
          text-xs
          font-semibold
          text-blue-600
        "
      >
        {hasFilters ? "No matching positions" : "No positions yet"}
      </div>

      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
        {hasFilters
          ? "Try changing your filters"
          : "Create your first hiring post"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Change the search term or status filter to see more results."
          : "Publish structured job posts and manage them from one place."}
      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={onCreate}
          disabled={!canManage}
          className="
            mt-6
            rounded-xl
            bg-blue-600
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Create job post
        </button>
      )}
    </div>
  );
}

/* =========================================================
   TABLE
========================================================= */

function Th({ children, align = "left" }) {
  return (
    <th
      className={`
        px-5
        py-3.5
        text-${align}
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.1em]
        text-slate-400
      `}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left" }) {
  return (
    <td
      className={`
        px-5
        py-4
        text-sm
        text-slate-600
        ${align === "right" ? "text-right" : ""}
      `}
    >
      {children}
    </td>
  );
}

/* =========================================================
   MAIN
========================================================= */

function HiringManagement() {
  const { can } = usePermissions();

  const canManage = can(PERMISSIONS.HIRING.MANAGE);

  const [hiring, setHiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [sortBy, setSortBy] = useState("publishDate_desc");

  const [viewMode, setViewMode] = useState("grid");

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingItem, setEditingItem] = useState(null);

  const [deleteItem, setDeleteItem] = useState(null);

  const [previewItem, setPreviewItem] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);

  /* =======================================================
     DATA
  ======================================================= */

  const fetchHiring = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await contentAPI.get("/hiring");

      setHiring(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching hiring posts:", error);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchHiring();
  }, []);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    return {
      total: hiring.length,

      published: hiring.filter((item) => item.status === "published").length,

      drafts: hiring.filter((item) => item.status === "draft").length,

      closed: hiring.filter((item) => item.status === "closed").length,
    };
  }, [hiring]);

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredHiring = useMemo(() => {
    const term = search.trim().toLowerCase();

    let data = hiring.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesSearch =
        !term ||
        [item.title, item.location, item.type, item.description]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });

    data = [...data].sort((a, b) => {
      switch (sortBy) {
        case "title_asc":
          return String(a.title || "").localeCompare(String(b.title || ""));

        case "title_desc":
          return String(b.title || "").localeCompare(String(a.title || ""));

        case "location_asc":
          return String(a.location || "").localeCompare(
            String(b.location || ""),
          );

        case "location_desc":
          return String(b.location || "").localeCompare(
            String(a.location || ""),
          );

        case "status_asc":
          return String(a.status || "").localeCompare(String(b.status || ""));

        case "status_desc":
          return String(b.status || "").localeCompare(String(a.status || ""));

        default:
          return new Date(b.publishDate || 0) - new Date(a.publishDate || 0);
      }
    });

    return data;
  }, [hiring, search, statusFilter, sortBy]);

  /* =======================================================
     FORM
  ======================================================= */

  const openCreate = () => {
    setEditingItem(null);
    setFormError("");
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormError("");

    setForm({
      title: item.title || "",
      location: item.location || "",
      type: item.type || "",
      description: item.description || "",

      requirementsText: (item.requirements || []).join("\n"),

      benefitsText: (item.benefits || []).join("\n"),

      status: item.status || "draft",

      publishDate: item.publishDate
        ? new Date(item.publishDate).toISOString().slice(0, 10)
        : "",
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;

    setIsFormOpen(false);
    setEditingItem(null);
    setFormError("");
    setForm(EMPTY_FORM);
  };

  const submitForm = async (event) => {
    event.preventDefault();

    setFormError("");

    const payload = {
      title: form.title.trim(),
      location: form.location.trim(),
      type: form.type.trim(),
      description: form.description.trim(),

      requirements: splitLines(form.requirementsText),

      benefits: splitLines(form.benefitsText),

      status: form.status,

      ...(form.publishDate
        ? {
            publishDate: new Date(form.publishDate).toISOString(),
          }
        : {}),
    };

    if (
      !payload.title ||
      !payload.location ||
      !payload.type ||
      !payload.description
    ) {
      setFormError("Please fill in title, location, type, and description.");

      return;
    }

    try {
      setSubmitting(true);

      if (editingItem?._id) {
        await contentAPI.put(`/hiring/${editingItem._id}`, payload);
      } else {
        await contentAPI.post("/hiring", payload);
      }

      await fetchHiring(true);

      closeForm();
    } catch (error) {
      console.error("Error saving hiring post:", error);

      setFormError(
        error?.response?.data?.message || "Failed to save hiring post.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const confirmDelete = (item) => {
    if (!canManage) return;

    setDeleteItem(item);
  };

  const handleDelete = async () => {
    if (!deleteItem?._id) return;

    try {
      setSubmitting(true);

      await contentAPI.delete(`/hiring/${deleteItem._id}`);

      await fetchHiring(true);

      setDeleteItem(null);
    } catch (error) {
      console.error("Error deleting hiring post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-[#f5f8fc] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        {/* =================================================
            FLOATING COMMAND BAR
        ================================================= */}

        <div className="sticky top-4 z-40 mb-6">
          <div
            className="
              flex
              flex-col
              gap-4
              rounded-[24px]
              border
              border-white/80
              bg-white/72
              px-4
              py-3
              backdrop-blur-2xl
              backdrop-saturate-150
              shadow-xs
              sm:px-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="
                    text-2xl
                    font-semibold
                    tracking-tight
                    text-slate-950
                  "
                >
                  Hiring
                </h1>

                <span
                  className="
                    rounded-full
                    bg-blue-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-semibold
                    tabular-nums
                    text-blue-700
                  "
                >
                  {stats.total}
                </span>
              </div>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Create, organize and publish job opportunities.
              </p>
            </div>

            <div className="flex w-full items-center gap-2 lg:w-auto">
              <button
                type="button"
                onClick={() => fetchHiring(true)}
                disabled={refreshing}
                className="
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-slate-200/80
                  bg-white/70
                  text-slate-500
                  transition
                  hover:border-blue-100
                  hover:bg-blue-50
                  hover:text-blue-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                title="Refresh"
                aria-label="Refresh hiring posts"
              >
                <RefreshCw
                  className={`
                    h-4
                    w-4
                    ${refreshing ? "animate-spin" : ""}
                  `}
                />
              </button>

              <button
                type="button"
                onClick={openCreate}
                disabled={!canManage}
                className="
                  inline-flex
                  h-10
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  active:bg-blue-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  lg:flex-none
                "
              >
                <Plus className="h-4 w-4" />
                New job post
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div
          className="
            mb-6
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-4
          "
        >
          <StatCard label="Total posts" value={stats.total} />

          <StatCard label="Published" value={stats.published} active />

          <StatCard label="Drafts" value={stats.drafts} />

          <StatCard label="Closed" value={stats.closed} />
        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div
          className="
            mb-5
            rounded-[24px]
            border
            border-slate-200/70
            bg-white
            p-3
          "
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, location, type or description..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50/60
                  pl-10
                  pr-4
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-blue-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-500/10
                "
              />
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-2
                sm:grid-cols-4
                xl:w-auto
              "
            >
              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="min-w-[150px]"
              >
                <option value="all">All statuses</option>

                <option value="published">Published</option>

                <option value="draft">Draft</option>

                <option value="closed">Closed</option>
              </Select>

              <Select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="min-w-[160px]"
              >
                <option value="publishDate_desc">Newest first</option>

                <option value="title_asc">Title A → Z</option>

                <option value="title_desc">Title Z → A</option>

                <option value="location_asc">Location A → Z</option>

                <option value="location_desc">Location Z → A</option>

                <option value="status_asc">Status A → Z</option>

                <option value="status_desc">Status Z → A</option>
              </Select>

              {/* View selector */}
              <div
                className="
                  col-span-2
                  flex
                  h-11
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-100/70
                  p-1
                  sm:col-span-2
                "
              >
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`
                    flex
                    flex-1
                    items-center
                    justify-center
                    rounded-lg
                    text-xs
                    font-medium
                    transition
                    ${
                      viewMode === "grid"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }
                  `}
                >
                  Grid
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`
                    flex
                    flex-1
                    items-center
                    justify-center
                    rounded-lg
                    text-xs
                    font-medium
                    transition
                    ${
                      viewMode === "table"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }
                  `}
                >
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            RESULTS
        ================================================= */}

        <div
          className="
            rounded-[24px]
            border
            border-slate-200/70
            bg-white
            overflow-hidden
          "
        >
          {/* Result header */}
          <div
            className="
              flex
              flex-col
              gap-1
              border-b
              border-slate-100
              px-5
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">Job posts</p>

              <p className="mt-0.5 text-xs text-slate-400">
                {filteredHiring.length}{" "}
                {filteredHiring.length === 1 ? "result" : "results"}
              </p>
            </div>

            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="
                  self-start
                  rounded-lg
                  px-2
                  py-1.5
                  text-xs
                  font-medium
                  text-blue-600
                  transition
                  hover:bg-blue-50
                  sm:self-auto
                "
              >
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div
              className="
                grid
                gap-5
                p-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="
                    h-[270px]
                    animate-pulse
                    rounded-[24px]
                    bg-slate-100
                  "
                />
              ))}
            </div>
          ) : filteredHiring.length === 0 ? (
            <EmptyState
              onCreate={openCreate}
              hasFilters={Boolean(search || statusFilter !== "all")}
              canManage={canManage}
            />
          ) : viewMode === "grid" ? (
            <div
              className="
                grid
                gap-5
                p-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {filteredHiring.map((item) => (
                <HiringCard
                  key={item._id}
                  item={item}
                  onEdit={openEdit}
                  onDelete={confirmDelete}
                  onPreview={setPreviewItem}
                  canManage={canManage}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-100 bg-slate-50/70">
                  <tr>
                    <Th>Position</Th>
                    <Th>Location</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th>Publish date</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredHiring.map((item) => {
                    const meta = STATUS_META[item.status] || STATUS_META.draft;

                    return (
                      <tr
                        key={item._id}
                        className="
                            transition
                            hover:bg-blue-50/30
                          "
                      >
                        <Td>
                          <div className="max-w-[420px]">
                            <p className="font-semibold text-slate-900">
                              {item.title}
                            </p>

                            <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                              {item.description}
                            </p>
                          </div>
                        </Td>

                        <Td>{item.location || "—"}</Td>

                        <Td>{item.type || "—"}</Td>

                        <Td>
                          <span
                            className={`
                                inline-flex
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-[10px]
                                font-semibold
                                ${meta.className}
                              `}
                          >
                            {meta.label}
                          </span>
                        </Td>

                        <Td>{formatDate(item.publishDate)}</Td>

                        <Td align="right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="
                                  rounded-xl
                                  border
                                  border-slate-200
                                  bg-white
                                  px-3
                                  py-2
                                  text-xs
                                  font-medium
                                  text-slate-600
                                  transition
                                  hover:border-blue-100
                                  hover:bg-blue-50
                                  hover:text-blue-700
                                "
                            >
                              Preview
                            </button>

                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              disabled={!canManage}
                              className="
                                  rounded-xl
                                  border
                                  border-slate-200
                                  bg-white
                                  px-3
                                  py-2
                                  text-xs
                                  font-medium
                                  text-slate-600
                                  transition
                                  hover:border-blue-100
                                  hover:bg-blue-50
                                  hover:text-blue-700
                                  disabled:cursor-not-allowed
                                  disabled:opacity-40
                                "
                            >
                              Edit
                            </button>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =================================================
            CREATE / EDIT
        ================================================= */}

        <Modal
          open={isFormOpen}
          onClose={closeForm}
          title={editingItem ? "Edit job post" : "Create job post"}
          subtitle="Keep the position clear, structured and easy to scan."
          widthClass="max-w-4xl"
        >
          <form onSubmit={submitForm} className="space-y-6">
            {formError && (
              <div
                className="
                  rounded-2xl
                  border
                  border-red-100
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >
                {formError}
              </div>
            )}

            {/* Basic */}
            <div
              className="
                rounded-2xl
                border
                border-slate-200/70
                bg-slate-50/50
                p-4
                sm:p-5
              "
            >
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                  Basic information
                </p>

                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  Position details
                </h3>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel required>Title</FieldLabel>

                  <TextInput
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Frontend Developer"
                    required
                  />
                </div>

                <div>
                  <FieldLabel required>Location</FieldLabel>

                  <TextInput
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        location: event.target.value,
                      }))
                    }
                    placeholder="Remote / Algiers / Hybrid"
                    required
                  />
                </div>

                <div>
                  <FieldLabel required>Type</FieldLabel>

                  <TextInput
                    value={form.type}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        type: event.target.value,
                      }))
                    }
                    placeholder="Full-time / Part-time / Contract"
                    required
                  />
                </div>

                <div>
                  <FieldLabel>Status</FieldLabel>

                  <Select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="draft">Draft</option>

                    <option value="published">Published</option>

                    <option value="closed">Closed</option>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Publish date</FieldLabel>

                  <TextInput
                    type="date"
                    value={form.publishDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        publishDate: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div
              className="
                rounded-2xl
                border
                border-slate-200/70
                bg-slate-50/50
                p-4
                sm:p-5
              "
            >
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                  Content
                </p>

                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  Job description
                </h3>
              </div>

              <FieldLabel required>Description</FieldLabel>

              <TextArea
                rows={7}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Write a clear description of the role, responsibilities and expectations..."
                required
              />
            </div>

            {/* Requirements / Benefits */}
            <div
              className="
                grid
                gap-5
                md:grid-cols-2
              "
            >
              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200/70
                  bg-slate-50/50
                  p-4
                  sm:p-5
                "
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                  Requirements
                </p>

                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  What candidates need
                </h3>

                <TextArea
                  rows={9}
                  className="mt-4"
                  value={form.requirementsText}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      requirementsText: event.target.value,
                    }))
                  }
                  placeholder={`3+ years experience
React / TypeScript
Strong communication`}
                />

                <p className="mt-2 text-xs text-slate-400">
                  One requirement per line.
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200/70
                  bg-slate-50/50
                  p-4
                  sm:p-5
                "
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                  Benefits
                </p>

                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  What candidates receive
                </h3>

                <TextArea
                  rows={9}
                  className="mt-4"
                  value={form.benefitsText}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      benefitsText: event.target.value,
                    }))
                  }
                  placeholder={`Flexible schedule
Professional development
Remote work`}
                />

                <p className="mt-2 text-xs text-slate-400">
                  One benefit per line.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div
              className="
                sticky
                bottom-0
                -mx-5
                flex
                flex-col-reverse
                gap-2
                border-t
                border-slate-100
                bg-white/90
                px-5
                py-4
                backdrop-blur-xl
                sm:-mx-6
                sm:flex-row
                sm:justify-end
                sm:px-6
              "
            >
              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="
                  h-10
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="
                  h-10
                  rounded-xl
                  bg-blue-600
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {submitting
                  ? "Saving..."
                  : editingItem
                    ? "Save changes"
                    : "Create job post"}
              </button>
            </div>
          </form>
        </Modal>

        {/* =================================================
            PREVIEW
        ================================================= */}

        <Modal
          open={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          title="Job preview"
          subtitle="Review the position before publishing."
          widthClass="max-w-5xl"
        >
          {previewItem && (
            <div className="space-y-6">
              <div
                className="
                  rounded-3xl
                  border
                  border-blue-100
                  bg-blue-50/50
                  p-5
                  sm:p-6
                "
              >
                <span
                  className={`
                    inline-flex
                    rounded-full
                    border
                    px-2.5
                    py-1
                    text-[10px]
                    font-semibold
                    ${
                      STATUS_META[previewItem.status]?.className ||
                      STATUS_META.draft.className
                    }
                  `}
                >
                  {STATUS_META[previewItem.status]?.label || previewItem.status}
                </span>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  {previewItem.title}
                </h2>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span>
                    {previewItem.location || "Location not specified"}
                  </span>

                  <span className="text-slate-300">·</span>

                  <span>{previewItem.type || "Type not specified"}</span>

                  <span className="text-slate-300">·</span>

                  <span>{formatDate(previewItem.publishDate)}</span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                  Description
                </p>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                    {previewItem.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                    Requirements
                  </p>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
                    {(previewItem.requirements || []).length > 0 ? (
                      <div className="space-y-2.5">
                        {previewItem.requirements.map((requirement, index) => (
                          <div
                            key={`${requirement}-${index}`}
                            className="
                                border-b
                                border-slate-100
                                pb-2.5
                                text-sm
                                text-slate-600
                                last:border-0
                                last:pb-0
                              "
                          >
                            {requirement}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        No requirements added.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                    Benefits
                  </p>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
                    {(previewItem.benefits || []).length > 0 ? (
                      <div className="space-y-2.5">
                        {previewItem.benefits.map((benefit, index) => (
                          <div
                            key={`${benefit}-${index}`}
                            className="
                                border-b
                                border-slate-100
                                pb-2.5
                                text-sm
                                text-slate-600
                                last:border-0
                                last:pb-0
                              "
                          >
                            {benefit}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        No benefits added.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* =================================================
            DELETE
        ================================================= */}

        <Modal
          open={Boolean(deleteItem)}
          onClose={() => {
            if (!submitting) {
              setDeleteItem(null);
            }
          }}
          title="Delete job post"
          subtitle="This action cannot be undone."
          widthClass="max-w-lg"
        >
          <div className="space-y-5">
            <div
              className="
                rounded-2xl
                border
                border-red-100
                bg-red-50
                p-4
              "
            >
              <p className="text-sm leading-6 text-red-700">
                You are about to permanently delete{" "}
                <span className="font-semibold">{deleteItem?.title}</span>.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                disabled={submitting}
                className="
                  h-10
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-slate-600
                  transition
                  hover:bg-slate-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="
                  h-10
                  rounded-xl
                  bg-red-600
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {submitting ? "Deleting..." : "Delete job post"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default HiringManagement;
