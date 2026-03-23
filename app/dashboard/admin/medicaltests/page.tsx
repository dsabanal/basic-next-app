"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from "@/components/MessageModal";
import ConfirmModal from "@/components/ConfirmModal";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import ButtonGuardWrapper from "@/components/ButtonGuardWrapper";
import {
  getMedicalTests,
  addMedicalTest,
  updateMedicalTest,
  deleteMedicalTest,
  getUomOptions,
  getCategoryOptions,
  MedicalTest,
  UomOption,
  CategoryOption,
} from "./actions";
import AddMedicalTestModal from "./AddMedicalTestModal";
import EditMedicalTestModal from "./EditMedicalTestModal";

export default function Page() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [tests, setTests] = useState<MedicalTest[]>([]);
  const [uomOptions, setUomOptions] = useState<UomOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testToEdit, setTestToEdit] = useState<MedicalTest | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/");
  }, [session, isPending, router]);

  const fetchAll = useCallback(() => {
    Promise.all([getMedicalTests(), getUomOptions(), getCategoryOptions()])
      .then(([t, u, c]) => {
        setTests(t);
        setUomOptions(u);
        setCategoryOptions(c);
      })
      .catch(console.error)
      .finally(() => setLoadingTests(false));
  }, []);

  useEffect(() => {
    if (session) fetchAll();
  }, [session, fetchAll]);

  const handleAdd = async (data: {
    name: string;
    description: string;
    iduom: number | null;
    idcategory: number | null;
    normalmin: number | null;
    normalmax: number | null;
  }) => {
    try {
      await addMedicalTest(data);
      await showMessage("Medical Test added successfully!");
      fetchAll();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to add medical test.");
    }
  };

  const handleEdit = async (data: {
    id: number;
    name: string;
    description: string;
    iduom: number | null;
    idcategory: number | null;
    normalmin: number | null;
    normalmax: number | null;
  }) => {
    try {
      await updateMedicalTest(data);
      await showMessage("Medical Test updated successfully!");
      fetchAll();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to update medical test.");
    }
  };

  const handleDelete = async (test: MedicalTest) => {
    const confirmed = await ConfirmModal(`Delete medical test "${test.name}"?`, {
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okColor: "bg-red-600 hover:bg-red-700",
    });
    if (!confirmed) return;
    try {
      await deleteMedicalTest(test.id);
      await showMessage("Medical Test deleted successfully!");
      fetchAll();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to delete medical test.");
    }
  };

  if (isPending || !session) return <div className="p-6">Loading...</div>;

  const filteredTests = tests.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.categoryname && t.categoryname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.uomname && t.uomname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
      <div className="space-y-4">
        {/* Header & Controls */}
        <div className="flex items-center justify-between gap-x-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
            Medical Tests
          </h1>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search tests..."
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
              + Add Test
            </button>
          </ButtonGuardWrapper>
        </div>

        <AddMedicalTestModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAdd}
          uomOptions={uomOptions}
          categoryOptions={categoryOptions}
        />
        <EditMedicalTestModal
          isOpen={!!testToEdit}
          onClose={() => setTestToEdit(null)}
          onEdit={handleEdit}
          test={testToEdit}
          uomOptions={uomOptions}
          categoryOptions={categoryOptions}
        />

        {/* Table — shows Category Name and UOM Name (not IDs) via JOIN */}
        <div className="max-h-[calc(100vh-260px)] overflow-auto rounded border bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Row #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Test Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Normal Min</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Normal Max</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTests.map((test, index) => (
                <tr key={test.id} className="even:bg-gray-50/80 hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-2 text-sm">{index + 1}</td>
                  <td className="px-4 py-2 text-sm font-medium">{test.name}</td>
                  {/* Category name from JOIN — never shows the numeric ID */}
                  <td className="px-4 py-2 text-sm">
                    {test.categoryname ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {test.categoryname}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  {/* UOM name from JOIN — never shows the numeric ID */}
                  <td className="px-4 py-2 text-sm">
                    {test.uomname ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {test.uomname}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {test.normalmin != null ? test.normalmin.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {test.normalmax != null ? test.normalmax.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-sm space-x-2">
                    <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
                      <button
                        onClick={() => setTestToEdit(test)}
                        className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600"
                      >
                        Edit
                      </button>
                    </ButtonGuardWrapper>
                    <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
                      <button
                        onClick={() => handleDelete(test)}
                        className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </ButtonGuardWrapper>
                  </td>
                </tr>
              ))}
              {!loadingTests && filteredTests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-gray-500">No medical tests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-2 text-sm text-gray-700">
          Showing {filteredTests.length} of {tests.length} records
        </div>
      </div>
    </PageGuardWrapper>
  );
}