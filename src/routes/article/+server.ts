import { error, json, type RequestHandler } from '@sveltejs/kit';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export const POST: RequestHandler = async ({ request }) => {
	const { type, payload } = await request.json();
	if (!type || !payload) throw error(400, 'No URL or payload provided');
	console.log(type, payload);
	if (type !== 'url' && type !== 'html') throw error(400, 'Invalid type');

	let decoded: string;
	try {
		decoded = Buffer.from(payload, 'base64').toString('utf-8');
	} catch (e) {
		throw error(400, 'Invalid payload');
	}

	let dom: JSDOM;
	if (type === 'url') {
		const url = decoded;
		dom = await JSDOM.fromURL(url);
	} else {
		dom = new JSDOM(decoded);
	}

	const reader = new Readability(dom.window.document);
	const article = reader.parse() ?? { textContent: '', title: '', length: 0, lang: '' };

	const { textContent, title, length, lang } = article;

	return json({ content: clean(textContent), title, length, lang });
};

const clean = (str: string) => {
	const multipleNewLinesToDouble = str.replace(/(\n\s*){2,}/g, '\n\n');
	const singleNewLinesToDouble = multipleNewLinesToDouble.replace(/(?<!\n)\n(?!\n)/g, '\n\n');
	const singleWhiteSpace = singleNewLinesToDouble.replace(/[ ]+/g, ' ');
	const final = singleWhiteSpace.trim();
	return final;
};
