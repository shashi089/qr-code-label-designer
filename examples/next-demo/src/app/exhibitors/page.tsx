"use client";

import { EntityMaster } from "@/components/EntityMaster";
import { storage } from "@/lib/storage";
import type { Exhibitor } from "@/lib/types";

export default function ExhibitorsPage() {
  return (
    <EntityMaster<Exhibitor>
      entityType="exhibitor"
      title="Exhibitor Master"
      description="Manage sponsor booths and print hall labels"
      exportBaseFilename="exhibitor-booth"
      columns={[
        { header: "Company", accessorKey: "companyName" },
        { header: "Booth", accessorKey: "boothNumber" },
        { header: "Hall", accessorKey: "hall" },
        { header: "Category", accessorKey: "category" },
      ]}
      formFields={[
        {
          name: "companyName",
          label: "Company Name",
          required: true,
          placeholder: "e.g. CloudScale Inc",
        },
        {
          name: "boothNumber",
          label: "Booth Number",
          required: true,
          placeholder: "e.g. B-14",
        },
        {
          name: "hall",
          label: "Hall",
          placeholder: "e.g. Hall B",
        },
        {
          name: "category",
          label: "Category",
          placeholder: "Platinum Sponsor, Exhibitor, etc.",
        },
      ]}
      getRecords={storage.getExhibitors}
      addRecord={storage.addExhibitor}
      deleteRecord={storage.deleteExhibitor}
      validate={(formData) =>
        !!(formData.companyName && formData.boothNumber)
      }
      buildRecord={(formData, editing) => ({
        id: editing?.id ?? crypto.randomUUID(),
        companyName: formData.companyName,
        boothNumber: formData.boothNumber,
        hall: formData.hall ?? "",
        category: formData.category ?? "Exhibitor",
      })}
    />
  );
}
