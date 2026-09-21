export type Theme = 'rose' | 'mint' | 'blue' | 'cream' | 'pink' | 'white' | 'lilac';

export interface Site {
  category: string;
  title: string;
  url: string;
  description: string;
  icon: string;
  theme: Theme;
}

const themes = new Set<Theme>(['rose', 'mint', 'blue', 'cream', 'pink', 'white', 'lilac']);
const requiredHeaders = ['category', 'title', 'url'];

/** RFC 4180 스타일의 따옴표, 쉼표, 줄바꿈과 UTF-8 BOM을 처리합니다. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === '') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (quoted) throw new Error('CSV의 따옴표가 닫히지 않았습니다.');
  row.push(cell.trim());
  if (row.some((value) => value !== '')) rows.push(row);
  return rows;
}

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export function readSites(input: string): { sites: Site[]; warnings: string[] } {
  const [header, ...rows] = parseCsv(input);
  if (!header) throw new Error('CSV가 비어 있습니다.');
  const columns = new Map(header.map((name, index) => [name.toLowerCase(), index] as const));
  const missing = requiredHeaders.filter((name) => !columns.has(name));
  if (missing.length) throw new Error(`CSV 필수 열이 없습니다: ${missing.join(', ')}`);

  const get = (row: string[], name: string) => row[columns.get(name) ?? -1] ?? '';
  const sites: Site[] = [];
  const warnings: string[] = [];

  rows.forEach((row, index) => {
    const category = get(row, 'category');
    const title = get(row, 'title');
    const url = safeHttpUrl(get(row, 'url'));
    if (!category || !title || !url) {
      warnings.push(`${index + 2}행: 분류·이름·http(s) URL을 확인해 주세요.`);
      return;
    }
    const iconValue = get(row, 'icon');
    const icon = iconValue ? safeHttpUrl(iconValue) ?? '' : '';
    const themeValue = get(row, 'theme') as Theme;
    sites.push({
      category,
      title,
      url,
      description: get(row, 'description'),
      icon,
      theme: themes.has(themeValue) ? themeValue : 'white',
    });
  });

  return { sites, warnings };
}
