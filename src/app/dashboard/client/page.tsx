"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GET_CUSTOMER_SESSIONS } from "@/libs/ServerAction";
import {
  ItemContainer,
  ItemCard,
  ItemCardInner,
  StatusBadge,
  SecondaryButton,
  PrimaryButton,
} from "@/components";
import { ICustomerSession } from "@/types";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiChevronUp,
  FiChevronDown,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

type SortKey =
  | "last_name"
  | "first_names"
  | "email"
  | "phone"
  | "status"
  | "date";
type SortDir = "asc" | "desc";

type PageSizeOption = 25 | 50 | 100 | "all";

const PAGE_SIZE_OPTIONS: { value: PageSizeOption; label: string }[] = [
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: "all", label: "Tous" },
];

const btnExportClass =
  "flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed";

const btnGhostClass =
  "flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white disabled:opacity-50";

const sortHeaderBtnClass =
  "inline-flex items-center gap-1 font-semibold text-text hover:text-orange-500 transition-all duration-300";

const statusLabels: Record<ICustomerSession["status"], string> = {
  Validated: "Validée",
  Waiting: "En attente",
  Canceled: "Annulée",
};

function formatSessionDate(value: Date | string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

function escapeCsvCell(value: string): string {
  const s = value.replace(/"/g, '""');
  if (/[",\n\r]/.test(s)) return `"${s}"`;
  return s;
}

function downloadCsv(rows: ICustomerSession[], filename: string) {
  const header = [
    "Nom",
    "Prénoms",
    "Email",
    "Téléphone",
    "Statut",
    "Date de la sortie",
  ];
  const lines = [
    header.join(";"),
    ...rows.map((r) =>
      [
        escapeCsvCell(r.last_name ?? ""),
        escapeCsvCell(r.first_names ?? ""),
        escapeCsvCell(r.email ?? ""),
        escapeCsvCell(r.phone ?? ""),
        escapeCsvCell(statusLabels[r.status] ?? r.status),
        escapeCsvCell(formatSessionDate(r.date)),
      ].join(";")
    ),
  ];
  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ClientPage = () => {
  const [rows, setRows] = useState<ICustomerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [pageSize, setPageSize] = useState<PageSizeOption>(50);
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await GET_CUSTOMER_SESSIONS();
      if (res.success && res.data) {
        setRows(res.data);
      } else {
        setError(res.error ?? "Impossible de charger les clients");
        setRows([]);
      }
    } catch (e) {
      setError((e as Error).message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "date" ? "desc" : "asc");
    }
  };

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...rows];

    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (q) {
      list = list.filter((r) => {
        const pack = [r.last_name, r.first_names, r.email, r.phone]
          .join(" ")
          .toLowerCase();
        return pack.includes(q);
      });
    }

    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "date") {
        return (
          (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir
        );
      }
      if (sortKey === "status") {
        return a.status.localeCompare(b.status, "fr") * dir;
      }
      const va = String(a[sortKey] ?? "").toLowerCase();
      const vb = String(b[sortKey] ?? "").toLowerCase();
      return va.localeCompare(vb, "fr", { sensitivity: "base" }) * dir;
    });

    return list;
  }, [rows, search, statusFilter, sortKey, sortDir]);

  const filteredIds = useMemo(
    () => new Set(filteredSorted.map((r) => String(r._id))),
    [filteredSorted]
  );

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (filteredIds.has(id)) next.add(id);
      }
      return next;
    });
  }, [search, statusFilter, rows, filteredIds]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortKey, sortDir, pageSize]);

  const totalFiltered = filteredSorted.length;
  const totalPages =
    pageSize === "all"
      ? 1
      : Math.max(1, Math.ceil(totalFiltered / pageSize));

  const safePage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    if (pageSize === "all") return filteredSorted;
    const start = (safePage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, pageSize, safePage]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const visibleIds = useMemo(
    () => paginatedRows.map((r) => String(r._id)),
    [paginatedRows]
  );

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.has(id));

  useEffect(() => {
    const el = headerCheckboxRef.current;
    if (el) {
      el.indeterminate = someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected, paginatedRows]);

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const id of visibleIds) next.delete(id);
      } else {
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(new Set(filteredSorted.map((r) => String(r._id))));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const rowsFromSelection = useMemo(
    () => filteredSorted.filter((r) => selectedIds.has(String(r._id))),
    [filteredSorted, selectedIds]
  );

  const exportSelectionCsv = () => {
    if (rowsFromSelection.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      rowsFromSelection,
      `clients-easylis-selection-${rowsFromSelection.length}-${stamp}.csv`
    );
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDir === "asc" ? (
      <FiChevronUp className="inline ml-1" aria-hidden />
    ) : (
      <FiChevronDown className="inline ml-1" aria-hidden />
    );
  };

  const selectionCount = rowsFromSelection.length;

  return (
    <ItemContainer className="w-full flex flex-col items-center justify-center gap-10 min-h-[80vh] px-2 md:px-4">
   

      <div className="w-full max-w-[1200px]">
        <ItemCard className="py-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1 min-w-0 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiFilter aria-hidden />
                Filtres
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="client-search"
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Recherche
                  </label>
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      aria-hidden
                    />
                    <input
                      id="client-search"
                      type="search"
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-base font-medium text-gray-700 outline-none transition"
                      placeholder="Nom, prénoms, email ou téléphone…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="client-status"
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Statut de la réservation
                  </label>
                  <select
                    id="client-status"
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-base font-medium text-gray-700 outline-none transition"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="Validated">Validée</option>
                    <option value="Waiting">En attente</option>
                    <option value="Canceled">Annulée</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch lg:items-end gap-2 shrink-0 lg:pb-0.5">
              <SecondaryButton
                type="button"
                onClick={exportSelectionCsv}
                disabled={loading || selectionCount === 0}
                className={`${btnExportClass} w-full lg:w-auto whitespace-nowrap`}
              >
                <FiDownload className="text-lg shrink-0" aria-hidden />
                Exporter ma sélection
                {selectionCount > 0 ? ` (${selectionCount})` : ""}
              </SecondaryButton>
              <p className="text-xs text-gray-500 lg:text-right max-w-[280px]">
                Coche les lignes du tableau ou utilise « Tout sélectionner
                (filtre) » ci-dessous.
              </p>
            </div>
          </div>
        </ItemCard>
      </div>

      <div className="w-full max-w-[1200px]">
        <ItemCardInner className="p-2 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">
              Liste des réservations clients ({totalFiltered}
              {totalFiltered !== rows.length ? ` / ${rows.length}` : ""})
            </h2>
            {!loading && totalFiltered > 0 && (
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 text-sm">
                <label className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-text">Lignes par page</span>
                  <select
                    className="rounded-md border border-gray-300 bg-white py-1.5 px-2 font-medium text-gray-700 outline-none"
                    value={pageSize === "all" ? "all" : String(pageSize)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPageSize(
                        v === "all" ? "all" : (Number(v) as 25 | 50 | 100)
                      );
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((o) => (
                      <option
                        key={o.label}
                        value={o.value === "all" ? "all" : String(o.value)}
                      >
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                {pageSize !== "all" && totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <SecondaryButton
                      type="button"
                      className="p-2 min-w-10 min-h-10 flex items-center justify-center text-white shrink-0"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      title=""
                    >
                      <span className="sr-only">Page précédente</span>
                      <FiChevronLeft className="text-xl" aria-hidden />
                    </SecondaryButton>
                    <span className="text-gray-600 dark:text-gray-300 tabular-nums px-1">
                      Page {safePage} / {totalPages}
                    </span>
                    <SecondaryButton
                      type="button"
                      className="p-2 min-w-10 min-h-10 flex items-center justify-center text-white shrink-0"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      title=""
                    >
                      <span className="sr-only">Page suivante</span>
                      <FiChevronRight className="text-xl" aria-hidden />
                    </SecondaryButton>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <SecondaryButton
              type="button"
              onClick={selectAllFiltered}
              disabled={loading || totalFiltered === 0}
              className={btnGhostClass}
            >
              Tout sélectionner (filtre)
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={clearSelection}
              disabled={selectedIds.size === 0}
              className={`${btnGhostClass} hover:bg-sky-700 dark:hover:bg-sky-800 transition-all duration-300`}
            >
              Effacer la sélection ({selectedIds.size})
            </PrimaryButton>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <div className="text-center py-12 text-gray-500">Chargement…</div>
          ) : totalFiltered === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun client ne correspond aux filtres.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-600">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 text-text">
                  <tr>
                    <th
                      scope="col"
                      className="w-10 px-2 py-3 font-semibold text-center"
                    >
                      <input
                        ref={headerCheckboxRef}
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAllVisible}
                        aria-label="Sélectionner toutes les lignes de cette page"
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </th>
                    <th scope="col" className="px-3 py-3">
                      <button
                        type="button"
                        className={sortHeaderBtnClass}
                        onClick={() => handleSort("last_name")}
                      >
                        Nom
                        <SortIcon column="last_name" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3">
                      <button
                        type="button"
                        className={sortHeaderBtnClass}
                        onClick={() => handleSort("first_names")}
                      >
                        Prénoms
                        <SortIcon column="first_names" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3">
                      <button
                        type="button"
                        className={sortHeaderBtnClass}
                        onClick={() => handleSort("email")}
                      >
                        Email
                        <SortIcon column="email" />
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 whitespace-nowrap"
                    >
                      <button
                        type="button"
                        className={sortHeaderBtnClass}
                        onClick={() => handleSort("phone")}
                      >
                        Téléphone
                        <SortIcon column="phone" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3">
                      <button
                        type="button"
                        className={sortHeaderBtnClass}
                        onClick={() => handleSort("status")}
                      >
                        Statut
                        <SortIcon column="status" />
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 whitespace-nowrap"
                    >
                      <button
                        type="button"
                        className={sortHeaderBtnClass}
                        onClick={() => handleSort("date")}
                      >
                        Date sortie
                        <SortIcon column="date" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {paginatedRows.map((r) => {
                    const id = String(r._id);
                    return (
                      <tr
                        key={id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/40"
                      >
                        <td className="px-2 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(id)}
                            onChange={() => toggleRow(id)}
                            aria-label={`Sélectionner ${r.last_name} ${r.first_names}`}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-3 py-2.5 font-medium">{r.last_name}</td>
                        <td className="px-3 py-2.5">{r.first_names}</td>
                        <td className="px-3 py-2.5 break-all max-w-[220px]">
                          {r.email}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {r.phone}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge customerSession={r} />
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {formatSessionDate(r.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ItemCardInner>
      </div>
    </ItemContainer>
  );
};

export default ClientPage;
ClientPage.displayName = "ClientPage";
