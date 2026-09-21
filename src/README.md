# 링크 포털

`D:\work\MainPortal\project_design\1.png` 시안을 참고한 카드형 링크 페이지입니다. 별도 등록·편집 화면은 없습니다. `public/data/sites.csv`를 편집하면 화면에 반영됩니다.

## 로컬 실행

```powershell
cd D:\work\MainPortal\src
npm install
npm run dev
```

터미널에 표시된 주소로 접속합니다. 배포용 정적 파일은 `npm run build`로 생성합니다.

## Docker 실행

```powershell
cd D:\work\MainPortal\src
docker compose up --build -d
```

브라우저에서 `http://localhost:8080`에 접속합니다. Compose는 CSV 파일을 읽기 전용으로 마운트합니다. CSV 수정 뒤 약 15초 이내에 열려 있는 페이지가 다시 읽으며, 상단 **새로고침** 버튼이나 브라우저 새로고침으로 즉시 확인할 수도 있습니다. TypeScript·CSS 변경은 `docker compose up --build -d`로 재빌드해야 합니다.

## CSV 작성

`public/data/sites.csv`를 UTF-8로 저장합니다. 첫 줄은 아래 열 이름을 사용합니다.

| 열 | 내용 |
| --- | --- |
| `category` | 카드가 속할 그룹 이름 (필수) |
| `title` | 카드 제목 (필수) |
| `url` | 이동할 `https://` 또는 `http://` 주소 (필수) |
| `description` | 카드 설명 (선택) |
| `icon` | 아이콘 이미지의 `https://` 또는 `http://` 주소 (선택) |
| `theme` | `rose`, `mint`, `blue`, `cream`, `pink`, `white`, `lilac` 중 하나 (선택) |

```csv
category,title,url,description,icon,theme
자주 가는 사이트,예시,https://example.com/,설명 문구,https://example.com/favicon.ico,blue
```

쉼표나 줄바꿈이 들어가는 값은 큰따옴표로 감싸세요. 아이콘 URL을 비우거나 이미지 로딩에 실패하면 제목의 첫 글자가 표시됩니다. 잘못된 필수 값이 있는 행은 건너뛰고 화면에 경고가 표시됩니다. 브라우저 검색란에서 링크를 필터링할 수 있고, `Ctrl+K`로 검색란에 이동합니다. 검색란에서 Enter를 누르면 웹 주소 또는 Google 검색 결과를 새 탭으로 엽니다.
