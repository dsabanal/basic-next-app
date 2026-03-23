"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface MedicalTest {
  id: number;
  name: string;
  description: string | null;
  iduom: number | null;
  idcategory: number | null;
  uomname: string | null;
  categoryname: string | null;
  normalmin: number | null;
  normalmax: number | null;
}

export interface UomOption {
  id: number;
  name: string;
}

export interface CategoryOption {
  id: number;
  name: string;
}

export async function getMedicalTests(): Promise<MedicalTest[]> {
  const { rows } = await query<MedicalTest>(`
    SELECT
      mt.id,
      mt.name,
      mt.description,
      mt.iduom,
      mt.idcategory,
      u.name  AS uomname,
      tc.name AS categoryname,
      mt.normalmin,
      mt.normalmax
    FROM public.medicaltests mt
    LEFT JOIN public.uom u             ON mt.iduom      = u.id
    LEFT JOIN public.testcategories tc ON mt.idcategory = tc.id
    ORDER BY mt.name ASC
  `);
  return rows;
}

export async function getUomOptions(): Promise<UomOption[]> {
  const { rows } = await query<UomOption>(
    "SELECT id, name FROM public.uom ORDER BY name ASC"
  );
  return rows;
}

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const { rows } = await query<CategoryOption>(
    "SELECT id, name FROM public.testcategories ORDER BY name ASC"
  );
  return rows;
}

export async function addMedicalTest(data: {
  name: string;
  description: string;
  iduom: number | null;
  idcategory: number | null;
  normalmin: number | null;
  normalmax: number | null;
}): Promise<void> {
  await query(
    `INSERT INTO public.medicaltests (name, description, iduom, idcategory, normalmin, normalmax)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      data.name.trim(),
      data.description.trim() || null,
      data.iduom,
      data.idcategory,
      data.normalmin,
      data.normalmax,
    ]
  );
  revalidatePath("/dashboard/admin/medicaltests");
}

export async function updateMedicalTest(data: {
  id: number;
  name: string;
  description: string;
  iduom: number | null;
  idcategory: number | null;
  normalmin: number | null;
  normalmax: number | null;
}): Promise<void> {
  await query(
    `UPDATE public.medicaltests
     SET name = $2, description = $3, iduom = $4, idcategory = $5,
         normalmin = $6, normalmax = $7
     WHERE id = $1`,
    [
      data.id,
      data.name.trim(),
      data.description.trim() || null,
      data.iduom,
      data.idcategory,
      data.normalmin,
      data.normalmax,
    ]
  );
  revalidatePath("/dashboard/admin/medicaltests");
}

export async function deleteMedicalTest(id: number): Promise<void> {
  await query("DELETE FROM public.medicaltests WHERE id = $1", [id]);
  revalidatePath("/dashboard/admin/medicaltests");
}