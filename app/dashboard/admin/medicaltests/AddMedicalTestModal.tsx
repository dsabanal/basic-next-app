"use client";

import { useState, useRef, useEffect } from "react";
import { X, GripHorizontal } from "lucide-react";
import { UomOption, CategoryOption } from "./actions";

interface AddMedicalTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    name: string;
    description: string;
    iduom: number | null;
    idcategory: number | null;
    normalmin: number | null;
    normalmax: number | null;
  }) => Promise<void>;
  uomOptions: UomOption[];
  categoryOptions: CategoryOption[];
}

export default function AddMedicalTestModal({
  isOpen,
  onClose,
  onAdd,
  uomOptions,
  categoryOptions,
}: AddMedicalTestModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iduom, setIduom] = useState<string>("");
  const [idcategory, setIdcategory] = useState<string>("");
  const [normalmin, setNormalmin] = useState<string>("");
  const [normalmax, setNormalmax] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentTranslate = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setName(""); setDescription(""); setIduom(""); setIdcategory("");
      setNormalmin(""); setNormalmax("");
      setPosition({ x: 0, y: 0 });
      currentTranslate.current = { x: 0, y: 0 };
    }
  }, [isOpen]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: currentTranslate.current.x + (e.clientX - dragStart.current.x),
      y: currentTranslate.current.y + (e.clientY - dragStart.current.y),
    });
  };
  const onMouseUp = (e: MouseEvent) => {
    if (isDragging.current) {
      currentTranslate.current = {
        x: currentTranslate.current.x + (e.clientX - dragStart.current.x),
        y: currentTranslate.current.y + (e.clientY - dragStart.current.y),
      };
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd({
        name,
        description,
        iduom: iduom ? Number(iduom) : null,
        idcategory: idcategory ? Number(idcategory) : null,
        normalmin: normalmin !== "" ? Number(normalmin) : null,
        normalmax: normalmax !== "" ? Number(normalmax) : null,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div
          className="bg-blue-600 px-4 py-3 border-b flex items-center justify-between cursor-move select-none"
          onMouseDown={onMouseDown}
        >
          <div className="flex items-center gap-2 text-white font-semibold">
            <GripHorizontal size={20} className="text-white/70" />
            <span>Add Medical Test</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 rounded hover:bg-blue-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Test Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Fasting Blood Glucose"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoFocus
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-20"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={idcategory}
                onChange={(e) => setIdcategory(e.target.value)}
              >
                <option value="">— Select —</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Unit of Measure</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={iduom}
                onChange={(e) => setIduom(e.target.value)}
              >
                <option value="">— Select —</option>
                {uomOptions.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Normal Min</label>
              <input
                type="number"
                step="any"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. 70"
                value={normalmin}
                onChange={(e) => setNormalmin(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Normal Max</label>
              <input
                type="number"
                step="any"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. 99"
                value={normalmax}
                onChange={(e) => setNormalmax(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Test"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}