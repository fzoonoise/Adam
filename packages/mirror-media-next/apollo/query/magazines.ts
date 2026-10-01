import { graphql } from '../__generated__/content'

const fetchSpecials = graphql(`
  query fetchSpecials {
    magazines(
      where: { type: { equals: "special" }, state: { equals: "published" } }
      orderBy: { publishedDate: desc }
    ) {
      ...magazine
    }
  }
`)

const fetchWeeklies = graphql(`
  query fetchWeeklies {
    magazines(
      where: { type: { equals: "weekly" }, state: { equals: "published" } }
      orderBy: { createdAt: desc }
      take: 20
    ) {
      ...magazine
    }
  }
`)

export { fetchSpecials, fetchWeeklies }
