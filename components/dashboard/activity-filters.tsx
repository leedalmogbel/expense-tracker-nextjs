"use client"

import { Select, SelectItem } from "@/components/ui/select"

type Member = { user_id: string; role: string; full_name: string | null }

export function ActivityFilters({
  members,
  selectedMember,
  onMemberChange,
  selectedType,
  onTypeChange,
}: {
  members: Member[]
  selectedMember: string
  onMemberChange: (value: string) => void
  selectedType: string
  onTypeChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        aria-label="Filter by member"
        placeholder="All members"
        classNames={{ base: "w-auto min-w-[160px]", trigger: "h-10 min-h-10" }}
        selectedKeys={selectedMember ? [selectedMember] : []}
        onSelectionChange={(keys) => {
          const v = Array.from(keys)[0] as string | undefined
          onMemberChange(v ?? "")
        }}
      >
        {[
          <SelectItem key="all" textValue="All members">All members</SelectItem>,
          ...members.map((m) => (
            <SelectItem key={m.user_id} textValue={m.full_name || "Unknown"}>
              {m.full_name || "Unknown"}
            </SelectItem>
          )),
        ]}
      </Select>
      <Select
        aria-label="Filter by type"
        placeholder="All types"
        classNames={{ base: "w-auto min-w-[140px]", trigger: "h-10 min-h-10" }}
        selectedKeys={selectedType ? [selectedType] : []}
        onSelectionChange={(keys) => {
          const v = Array.from(keys)[0] as string | undefined
          onTypeChange(v ?? "")
        }}
      >
        <SelectItem key="all" textValue="All types">All types</SelectItem>
        <SelectItem key="expense" textValue="Expenses">Expenses</SelectItem>
        <SelectItem key="income" textValue="Income">Income</SelectItem>
      </Select>
    </div>
  )
}
