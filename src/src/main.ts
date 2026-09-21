import './style.css';
import { readSites, type Site } from './csv';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('앱 루트가 없습니다.');

const icon = (name: 'search' | 'external' | 'star' | 'folder' | 'cup' | 'heart' | 'refresh') => {
  const paths: Record<typeof name, string> = {
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
    external: '<path d="M13 4h7v7M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    folder: '<path d="M2 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>',
    cup: '<path d="M4 4h14v9a7 7 0 0 1-14 0zM18 6h2a3 3 0 0 1 0 6h-2M3 21h17"/>',
    heart: '<path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-8a5.2 5.2 0 0 0 0-7.4z"/>',
    refresh: '<path d="M20 11a8 8 0 1 0 .2 3M20 4v7h-7"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

app.innerHTML = `
  <div class="landscape" aria-hidden="true"><div class="mountain mountain-one"></div><div class="mountain mountain-two"></div></div>
  <main class="page">
    <header class="hero">
      <div class="hero-heading"><span class="sun" aria-hidden="true">☀</span><div><h1>좋은 하루예요!</h1><p>자주 가는 곳으로, 더 빠르고 편리하게.</p></div></div>
      <div class="hero-aside"><time id="today"></time><p>“오늘도, 좋은 일이 생길 거예요.”</p></div>
    </header>
    <div class="search-wrap">
      <span class="search-icon">${icon('search')}</span>
      <input id="search" type="search" autocomplete="off" aria-label="사이트 검색 또는 URL 입력" placeholder="웹에서 검색하거나 URL을 입력하세요." />
      <kbd>Ctrl + K</kbd>
    </div>
    <div class="toolbar"><span id="result-summary" role="status"></span><button id="reload" type="button" title="CSV 다시 읽기" aria-label="CSV 다시 읽기">${icon('refresh')} <span>새로고침</span></button></div>
    <div id="message" class="message" role="alert" hidden></div>
    <div id="sections"></div>
    <footer><span>자주 찾는 링크를 한곳에 모아두세요.</span><span>링크 목록은 CSV 파일에서 관리합니다.</span></footer>
  </main>
`;

const search = document.querySelector<HTMLInputElement>('#search')!;
const sections = document.querySelector<HTMLDivElement>('#sections')!;
const message = document.querySelector<HTMLDivElement>('#message')!;
const summary = document.querySelector<HTMLSpanElement>('#result-summary')!;
const reload = document.querySelector<HTMLButtonElement>('#reload')!;
const today = document.querySelector<HTMLTimeElement>('#today')!;

const now = new Date();
today.textContent = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(now);
today.dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

let sites: Site[] = [];
let lastCsv = '';

function categoryIcon(name: string): string {
  if (name.includes('자주')) return icon('star');
  if (name.includes('업무') || name.includes('학습')) return icon('folder');
  if (name.includes('쇼핑') || name.includes('생활')) return icon('cup');
  if (name.includes('여가') || name.includes('취미')) return icon('heart');
  return icon('folder');
}

function card(site: Site): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.className = `card theme-${site.theme}`;
  anchor.href = site.url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.setAttribute('aria-label', `${site.title} 열기 (새 탭)`);

  const badge = document.createElement('span');
  badge.className = 'site-icon';
  badge.textContent = site.title.slice(0, 1).toUpperCase();
  if (site.icon) {
    const image = document.createElement('img');
    image.src = site.icon;
    image.alt = '';
    image.loading = 'lazy';
    image.addEventListener('load', () => badge.classList.add('has-image'));
    image.addEventListener('error', () => image.remove());
    badge.append(image);
  }

  const out = document.createElement('span');
  out.className = 'external-icon';
  out.innerHTML = icon('external');
  const title = document.createElement('strong');
  title.textContent = site.title;
  const description = document.createElement('span');
  description.className = 'description';
  description.textContent = site.description;
  anchor.append(badge, out, title, description);
  return anchor;
}

function render(): void {
  const term = search.value.trim().toLocaleLowerCase();
  const visible = sites.filter((site) => `${site.category} ${site.title} ${site.description} ${site.url}`.toLocaleLowerCase().includes(term));
  const grouped = new Map<string, Site[]>();
  visible.forEach((site) => grouped.set(site.category, [...(grouped.get(site.category) ?? []), site]));
  sections.replaceChildren();

  for (const [name, items] of grouped) {
    const section = document.createElement('section');
    section.className = 'site-section';
    const heading = document.createElement('h2');
    heading.innerHTML = `<span class="category-icon">${categoryIcon(name)}</span>`;
    heading.append(document.createTextNode(name));
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    items.forEach((site) => grid.append(card(site)));
    section.append(heading, grid);
    sections.append(section);
  }

  summary.textContent = term ? `검색 결과 ${visible.length}개` : `총 ${sites.length}개의 사이트`;
  if (!visible.length && sites.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '검색 결과가 없습니다. 다른 단어를 입력해 보세요.';
    sections.append(empty);
  }
}

async function loadSites(): Promise<void> {
  reload.disabled = true;
  try {
    const response = await fetch(`/data/sites.csv?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`CSV 요청 실패 (${response.status})`);
    const csv = await response.text();
    const result = readSites(csv);
    if (csv !== lastCsv) {
      sites = result.sites;
      lastCsv = csv;
      render();
    }
    message.hidden = result.warnings.length === 0;
    message.textContent = result.warnings.length ? `일부 행을 건너뛰었습니다: ${result.warnings.join(' ')}` : '';
  } catch (error) {
    message.hidden = false;
    message.textContent = `링크 목록을 읽지 못했습니다. ${error instanceof Error ? error.message : '알 수 없는 오류'} CSV 파일을 확인한 뒤 새로고침해 주세요.`;
  } finally {
    reload.disabled = false;
  }
}

search.addEventListener('input', render);
search.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const value = search.value.trim();
  if (!value) return;
  try {
    const looksLikeAddress = /^(https?:\/\/)?(?:localhost(?::\d+)?|(?:[\w-]+\.)+[\w-]{2,})(?:[/:?#][^\s]*)?$/i.test(value);
    if (!looksLikeAddress) throw new Error('검색어');
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      window.open(url.href, '_blank', 'noopener,noreferrer');
      return;
    }
  } catch { /* 일반 검색어는 검색 엔진으로 이동합니다. */ }
  window.open(`https://www.google.com/search?q=${encodeURIComponent(value)}`, '_blank', 'noopener,noreferrer');
});
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    search.focus();
    search.select();
  }
});
reload.addEventListener('click', loadSites);
void loadSites();
window.setInterval(() => { if (!document.hidden) void loadSites(); }, 15_000);
