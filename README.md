# MainPortal

CSV 파일로 링크를 관리하는 카드형 사이트 포털입니다. 별도 등록·편집 화면 없이 CSV를 수정해 카드 목록을 변경합니다.

## 폴더 구성

- `project_design/1.png`: 디자인 시안
- `src/`: TypeScript 앱, CSV 데이터, Dockerfile 및 `docker-compose.yml`
- `src/public/data/sites.csv`: 표시할 사이트 목록

## 실행

### 로컬 개발

```powershell
cd D:\work\MainPortal\src
npm install
npm run dev
```

### Docker Compose

```powershell
cd D:\work\MainPortal\src
docker compose up --build -d
```

Docker 실행 후 `http://localhost:8080`에 접속합니다. 링크를 추가하거나 수정할 때는 `src/public/data/sites.csv`를 UTF-8로 저장하세요. 열 형식과 세부 사용법은 [앱 README](src/README.md)에 있습니다.
