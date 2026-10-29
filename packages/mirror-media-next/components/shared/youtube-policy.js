import styled from 'styled-components'

const Wrapper = styled.div`
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #9b9b9b;
  text-align: center;
  width: 100%;
  padding: 0 16px;
  margin-top: 16px;
  ${({ theme }) => theme.breakpoint.md} {
    padding: unset;
    width: 328px;
    margin: 28px auto 0;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    width: 100%;
    margin-top: 33px;
  }
`

export default function YoutubePolicy() {
  return (
    <Wrapper>
      本網頁使用
      <a
        href="https://developers.google.com/youtube/terms/developer-policies#definition-youtube-api-services"
        target="_blank"
        rel="noopener noreferrer"
      >
        YouTube API 服務
      </a>
      ，詳見
      <a
        href="https://www.youtube.com/t/terms"
        target="_blank"
        rel="noopener noreferrer"
      >
        YouTube 服務條款
      </a>
      、
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
      >
        Google 隱私權與條款
      </a>
      。鏡週刊
      <a
        href="https://www.mirrormedia.mg/story/privacy/"
        target="_blank"
        rel="noopener"
      >
        隱私權政策
      </a>
    </Wrapper>
  )
}
