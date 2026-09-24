import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Label } from '../../label'
import { RadioGroup, RadioGroupItem } from '../../radio-group'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  render: (args) => (
    <RadioGroup defaultValue="regular" {...args}>
      <Label className="gap-2">
        <RadioGroupItem value="regular" />
        一般配送
      </Label>
      <Label className="gap-2">
        <RadioGroupItem value="registered" />
        郵寄掛號
      </Label>
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
