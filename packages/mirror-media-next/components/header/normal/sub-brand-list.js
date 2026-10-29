import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'
const SubBrandListWrapper = styled.ul`
  display: none;
  ${({ theme }) => theme.breakpoint.xl} {
    display: flex;
    align-content: center;
    justify-content: center;
    position: relative;
    align-items: center;
  }
`
const ListItem = styled.li`
  margin-left: 10px;
  margin-right: 10px;
  flex: 0 0 auto;
  cursor: pointer;
`

/**
 *
 * @param {Object} props
 * @param {import('../../../type').SubBrand[]} props.subBrands
 * @param {string} [props.className]
 * @returns
 */
export default function SubBrandList({ subBrands = [], className }) {
  return (
    <SubBrandListWrapper className={className}>
      {subBrands.map(({ name, title, href, imageSize }) => (
        <ListItem key={name}>
          <Link href={href} target="_blank" rel="noopener" aria-label={title}>
            <Image
              width={imageSize.normal.width}
              height={imageSize.normal.height}
              src={`/images-next/${name}.png`}
              alt={title}
              loading="eager"
            ></Image>
          </Link>
        </ListItem>
      ))}
    </SubBrandListWrapper>
  )
}
