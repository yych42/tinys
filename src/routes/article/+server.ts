import { error, json, type RequestHandler } from '@sveltejs/kit';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export const POST: RequestHandler = async ({ request }) => {
	const { url } = await request.json();
	if (!url) throw error(400, 'No URL provided');
	const dom = await JSDOM.fromURL(url);
	const reader = new Readability(dom.window.document);
	const article = reader.parse() ?? { textContent: '', title: '', length: 0, lang: '' };

	const { textContent, title, length, lang } = article;

	return json({ content: textContent, title, length, lang });
};
