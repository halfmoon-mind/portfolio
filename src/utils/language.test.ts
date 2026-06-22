import { describe, it, expect } from 'vitest';
import { getTranslation, primaryVariants } from './language';

const ko = { id: 'post-ko', data: { lang: 'ko', translationKey: 'post' } };
const en = { id: 'post-en', data: { lang: 'en', translationKey: 'post' } };
const lone = { id: 'lone', data: {} };
const all = [ko, en, lone];

describe('getTranslation', () => {
	it('ko 글이면 en 형제를 돌려준다', () => {
		expect(getTranslation(ko, all)).toBe(en);
	});
	it('en 글이면 ko 형제를 돌려준다', () => {
		expect(getTranslation(en, all)).toBe(ko);
	});
	it('번역 쌍이 없는 글이면 null', () => {
		expect(getTranslation(lone, all)).toBeNull();
	});
	it('자기 자신은 절대 반환하지 않는다', () => {
		expect(getTranslation(ko, [ko])).toBeNull();
	});
});

describe('primaryVariants', () => {
	it('ko+en 쌍은 ko canonical 하나로, 쌍 없는 글은 그대로', () => {
		expect(primaryVariants(all)).toEqual([ko, lone]);
	});
	it('배열 순서와 무관하게 ko를 canonical로 고른다', () => {
		expect(primaryVariants([en, ko])).toEqual([ko]);
	});
	it('ko가 없으면 그룹의 첫 항목을 남긴다', () => {
		const a = { id: 'a', data: { lang: 'en', translationKey: 'k' } };
		const b = { id: 'b', data: { lang: 'en', translationKey: 'k' } };
		expect(primaryVariants([a, b])).toEqual([a]);
	});
});
