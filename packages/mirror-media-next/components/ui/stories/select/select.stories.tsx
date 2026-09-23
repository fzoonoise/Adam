import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../select'

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select<string> defaultValue="month-1">
      <SelectTrigger aria-label="月份" className="w-64">
        <SelectValue placeholder="請選擇月份" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="month-1">一月</SelectItem>
        <SelectItem value="month-2">二月</SelectItem>
        <SelectItem value="month-3">三月</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const CustomHeight: Story = {
  render: () => (
    <Select<string>>
      <span className="mb-2 block text-lg">自訂欄位高度</span>
      <SelectTrigger aria-label="自訂欄位高度" className="h-12 w-72 text-lg">
        <SelectValue placeholder="請選擇項目" />
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        <SelectItem value="item-1">選項 1</SelectItem>
        <SelectItem value="item-2">選項 2</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select<string> disabled>
      <SelectTrigger aria-label="停用的縣市" className="w-64">
        <SelectValue placeholder="請先選擇國家" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="台北市">台北市</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const LongList: Story = {
  render: () => (
    <Select<string>>
      <SelectTrigger aria-label="長清單" className="w-64">
        <SelectValue placeholder="請選擇項目" />
      </SelectTrigger>
      <SelectContent className="max-h-43">
        {Array.from({ length: 40 }, (_, index) => (
          <SelectItem key={index} value={`item-${index + 1}`}>
            {`選項 ${index + 1}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}
