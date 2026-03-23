"use client";

import { useState, useRef, useEffect } from "react";
import { X, GripHorizontal } from "lucide-react";
import { Uom } from "./actions";

interface EditUomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: number, name: string, description: string) => Promise<void>;
  uom: Uom | null;
}

export default function EditUomModal({ isOpen, onClose, onEdit, uom }: EditUomModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentTranslate = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && uom) {
      setName(uom.name);
      setDescription(uom.description || "");
      setPosition({ x: 0, y: 0 });
      currentTranslate.current = { x: 0, y: 0 };
    }
  }, [isOpen, uom]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({ x: currentTranslate.current.x + dx, y: currentTranslate.current.y + dy });
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
    if (!uom || !name.trim()) return;
    setIsSubmitting(true);
    try {
      await onEdit(uom.id, name, description);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !uom) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div
          className="bg-amber-500 px-4 py-3 border-b flex items-center justify-between cursor-move select-none"
          onMouseDown={onMouseDown}
        >
          <div className="flex items-center gap-2 text-white font-semibold">
            <GripHorizontal size={20} className="text-white/70" />
            <span>Edit Unit of Measure</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 rounded hover:bg-amber-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
              autoFocus
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
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