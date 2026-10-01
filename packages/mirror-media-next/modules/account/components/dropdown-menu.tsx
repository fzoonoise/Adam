import { useId } from 'react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { ProfileOption } from '../account-types'

type DropdownMenuProps = {
  options: ProfileOption[]
  onSelect: (value: string) => void
  selectedOption: string
  label: string
  labelClassName: string
  disabled?: boolean
  placeholder?: string
}

export default function DropdownMenu({
  options,
  onSelect,
  selectedOption,
  label,
  labelClassName,
  disabled = false,
  placeholder = '請選擇',
}: DropdownMenuProps) {
  const triggerId = useId()

  return (
    <Select<string>
      value={selectedOption || null}
      onValueChange={(value) => {
        if (value !== null) onSelect(value)
      }}
      disabled={disabled}
      modal={false}
    >
      <Label className={labelClassName} htmlFor={triggerId}>
        {label}
      </Label>
      <SelectTrigger id={triggerId} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      {/* limit the visible items */}
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="max-h-43"
      >
        {options.map((option) => (
          <SelectItem key={option.key} value={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
