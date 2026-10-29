import Image from 'next/image'
import Script from 'next/script'
import { Accordion } from '@base-ui/react'
import { ChevronLeft } from 'lucide-react'

import { ThemeElement } from '@/components/shell/article/theme-element'
import { Typography } from '@/components/ui'
import { SITE_BASE_PATH } from '@/config/index.mjs'
import { generateFaqJsonLd } from '@/modules/story/story-json-ld'
import type { StoryPost } from '@/modules/story/story-types'

export default function ArticleQuestions({
  auto_faq,
  faqs_algo,
}: {
  auto_faq: StoryPost['auto_faq']
  faqs_algo: StoryPost['faqs_algo']
}) {
  if (
    auto_faq === null ||
    auto_faq === false ||
    faqs_algo === null ||
    faqs_algo.faqs === null ||
    faqs_algo.faqs.length === 0
  ) {
    return null
  }

  return (
    <section>
      <div className="flex w-full justify-center gap-x-2.5 rounded-lg border border-mm-base-700 px-2 py-1">
        <Image
          src={`${SITE_BASE_PATH}/images/sparks.svg`}
          alt="sparks"
          width={20}
          height={20}
        />
        <Typography variant="h6" className="text-mm-neutral-700">
          FAQ
        </Typography>
      </div>
      <Accordion.Root>
        {faqs_algo.faqs.map((faq, index) => (
          <Accordion.Item
            key={`faq-${index}`}
            value={`item-${index + 1}`}
            className="border-b border-mm-neutral-400 last:border-none"
          >
            <Accordion.Trigger className="group/panel gap-x2.5 grid w-full grid-cols-[1fr_10px] items-center p-2.5">
              <Typography
                as="div"
                variant="body-l"
                className="text-start text-mm-base-700"
              >
                {faq.question}
              </Typography>
              <ChevronLeft className="transform transition duration-200 group-data-panel-open/panel:-rotate-90" />
            </Accordion.Trigger>
            <Accordion.Panel>
              <ThemeElement
                as="div"
                theme="marketing"
                className="bg-mm-off-white p-2.5"
              >
                <Typography
                  as="div"
                  variant="body-l"
                  className="text-mm-neutral-400"
                >
                  {faq.answer}
                </Typography>
              </ThemeElement>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <Script
        id="faq-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFaqJsonLd(faqs_algo)),
        }}
      />
    </section>
  )
}
