import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Checkbox } from '../../checkbox'
import { Label } from '../../label'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="storybook-checkbox" {...args} />
      <Label htmlFor="storybook-checkbox">接受條款</Label>
    </div>
  ),
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
