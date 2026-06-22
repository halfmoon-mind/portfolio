// 블로그 글의 ko/en 번역 쌍을 frontmatter의 translationKey로 잇고,
// 목록/RSS에서 쌍이 중복으로 노출되지 않게 canonical 하나로 추려준다.

type Translatable = {
	id: string;
	data: { lang?: string; translationKey?: string };
};

/** post의 번역본(같은 translationKey, 다른 id)을 찾는다. 없으면 null, 자기 자신은 절대 반환하지 않는다. */
export function getTranslation<T extends Translatable>(post: T, all: T[]): T | null {
	const key = post.data.translationKey;
	if (!key) return null;
	return all.find((p) => p.id !== post.id && p.data.translationKey === key) ?? null;
}

/** ko/en 쌍을 canonical 하나로 합친다(ko 우선, ko가 없으면 그룹의 첫 항목). 쌍이 없는 글은 그대로 통과. */
export function primaryVariants<T extends Translatable>(all: T[]): T[] {
	return all.filter((post) => {
		const key = post.data.translationKey;
		if (!key) return true;
		const group = all.filter((p) => p.data.translationKey === key);
		const canonical = group.find((p) => (p.data.lang ?? 'ko') === 'ko') ?? group[0];
		return post.id === canonical.id;
	});
}
