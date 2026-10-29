import { atomicBlockRenderer } from '@mirrormedia/lilith-draft-renderer/lib/website/mirrormedia/block-renderer-fn'
import type { RawDraftEntity } from 'draft-js'

/**
 * Renders atomic entities the article page has no component of its own for
 * yet, through `@mirrormedia/lilith-draft-renderer`'s `AtomicBlock` (the same
 * one the legacy story page gets through `DraftRenderer`). It expects
 * draft-js instances rather than raw JSON, so only the methods it and the
 * block renderers call are shimmed. The renderers read `theme.breakpoint.md`
 * from the app-wide theme provided in `pages/_app.js`, which has the same
 * 768px breakpoint as lilith's own theme.
 */
export function LilithAtomicBlock({ entity }: { entity: RawDraftEntity }) {
  const draftEntity = {
    getType: () => entity.type,
    getData: () => entity.data,
  }
  /*
   - `getType: () => 'atomic'`：`atomicBlockRenderer` 只用 `getType()` 判斷是否為
     atomic block，不是才回傳 `null`。這裡只會從 `Blocks` 的 `atomic` 分支呼叫，
     所以寫死 `'atomic'`。
   - `'normal'`：只有 `style-normal` 的文章會用 `PostLayout`，舊版一般文章
     （`components/story/normal/article-content.js`）傳的也是 `'normal'`。lilith 會依
     `contentLayout` 改變樣式的只有 `ImageBlock`、`InfoBoxBlock`（例如 `'premium'`）
     及各 block 的 `'amp'` 分支，而 `image`、`INFOBOX` 在 `Blocks` 目前用自己的元件，
     不會走到這裡。
   - 不傳 `firstImageAdComponent`：只有 `ImageBlock` 會用到，圖片不會走到這裡。
   - 回傳的 `editable: false` 是給 draft-js `Editor` 的設定，這裡沒有用 `Editor`。
  */
  const { component: AtomicBlock, props } = atomicBlockRenderer(
    { getType: () => 'atomic' },
    'normal'
  )

  return (
    <AtomicBlock
      block={{ getEntityAt: () => '0' }}
      contentState={{ getEntity: () => draftEntity }}
      blockProps={props}
    />
  )
}
