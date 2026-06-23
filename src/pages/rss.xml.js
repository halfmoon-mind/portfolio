import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { primaryVariants } from '../utils/language';
import { byLocale } from '../i18n/content';

export async function GET(context) {
	const blogPosts = primaryVariants(await getCollection('blog'));
	const clips = byLocale(await getCollection('clips'), 'ko');

	const items = [
		...blogPosts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
		})),
		...clips.map((clip) => ({
			title: clip.data.title,
			description: clip.data.description,
			pubDate: clip.data.pubDate,
			link: `/clips/${clip.id}/`,
		})),
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items,
	});
}
