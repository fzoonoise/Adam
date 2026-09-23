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
  return (
    <Select<string>
      value={selectedOption || null}
      onValueChange={(value) => {
        if (value !== null) onSelect(value)
      }}
      disabled={disabled}
      modal={false}
    >
      <span className={labelClassName}>{label}</span>
      <SelectTrigger aria-label={label} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
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
