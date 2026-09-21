import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, readSites } from './csv.ts';

test('CSV BOM과 따옴표 안 쉼표·줄바꿈을 읽는다', () => {
  const rows = parseCsv('\uFEFFcategory,title,url\r\n"업무, 학습","두\n줄",https://example.com/\r\n');
  assert.deepEqual(rows, [
    ['category', 'title', 'url'],
    ['업무, 학습', '두\n줄', 'https://example.com/'],
  ]);
});

test('위험한 URL과 필수 값 누락 행을 제외한다', () => {
  const result = readSites('category,title,url\n좋은 곳,정상,https://example.com/\n위험,차단,javascript:alert(1)\n,누락,https://example.com/');
  assert.equal(result.sites.length, 1);
  assert.equal(result.warnings.length, 2);
});

test('필수 헤더 누락과 닫히지 않은 따옴표는 오류로 알린다', () => {
  assert.throws(() => readSites('title,url\n예시,https://example.com/'), /category/);
  assert.throws(() => parseCsv('"닫히지 않음'), /따옴표/);
});
