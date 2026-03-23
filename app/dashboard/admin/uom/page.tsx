"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from "@/components/MessageModal";
import ConfirmModal from "@/components/ConfirmModal";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import ButtonGuardWrapper from "@/components/ButtonGuardWrapper";
import { getUoms, addUom, updateUom, deleteUom, Uom } from "./actions";
import AddUomModal from "./AddUomModal";
import EditUomModal from "./EditUomModal";

export default function Page() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [uoms, setUoms] = useState<Uom[]>([]);
  const [loadingUoms, setLoadingUoms] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uomToEdit, setUomToEdit] = useState<Uom | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/");
  }, [session, isPending, router]);

  const fetchUoms = useCallback(() => {
    getUoms()
      .then(setUoms)
      .catch(console.error)
      .finally(() => setLoadingUoms(false));
  }, []);

  useEffect(() => {
    if (session) fetchUoms();
  }, [session, fetchUoms]);

  const handleAdd = async (name: string, description: string) => {
    try {
      await addUom(name, description);
      await showMessage("Unit of Measure added successfully!");
      fetchUoms();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to add UOM.");
    }
  };

  const handleEdit = async (id: number, name: string, description: string) => {
    try {
      await updateUom(id, name, description);
      await showMessage("Unit of Measure updated successfully!");
      fetchUoms();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to update UOM.");
    }
  };

  const handleDelete = async (uom: Uom) => {
    const confirmed = await ConfirmModal(`Delete UOM "${uom.name}"? This may affect Medical Tests using it.`, {
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okColor: "bg-red-600 hover:bg-red-700",
    });
    if (!confirmed) return;
    try {
      await deleteUom(uom.id);
      await showMessage("Unit of Measure deleted successfully!");
      fetchUoms();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to delete UOM. It may be in use by Medical Tests.");
    }
  };

  if (isPending || !session) return <div className="p-6">Loading...</div>;

  const filteredUoms = uoms.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.description && u.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
      <div className="space-y-4">
        {/* Header & Controls */}
        <div className="flex items-center justify-between gap-x-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
            Units of Measure
          </h1>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search UOMs..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </button>
          </div>

          <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            >
              + Add UOM
            </button>
          </ButtonGuardWrapper>
        </div>

        <AddUomModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAdd} />
        <EditUomModal isOpen={!!uomToEdit} onClose={() => setUomToEdit(null)} onEdit={handleEdit} uom={uomToEdit} />

        {/* Table */}
        <div className="max-h-[calc(100vh-260px)] overflow-auto rounded border bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Row #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUoms.map((uom, index) => (
                <tr key={uom.id} className="even:bg-gray-50/80 hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-2 text-sm">{index + 1}</td>
                  <td className="px-4 py-2 text-sm font-medium">{uom.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{uom.description || "-"}</td>
                  <td className="px-4 py-2 text-sm space-x-2">
                    <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
                      <button
                        onClick={() => setUomToEdit(uom)}
                        className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600"
                      >
                        Edit
                      </button>
                    </ButtonGuardWrapper>
                    <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
                      <button
                        onClick={() => handleDelete(uom)}
                        className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </ButtonGuardWrapper>
                  </td>
                </tr>
              ))}
              {!loadingUoms && filteredUoms.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No units of measure found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-2 text-sm text-gray-700">
          Showing {filteredUoms.length} of {uoms.length} records
        </div>
      </div>
    </PageGuardWrapper>
  );
}