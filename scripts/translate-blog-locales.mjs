import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const allLocales = ['en', 'ja', 'ko', 'es', 'fr', 'de', 'zh', 'zh-TW', 'pt', 'ar', 'it', 'id', 'vi', 'ro'];
const googleLocales = {
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  pt: 'pt',
  ar: 'ar',
  it: 'it',
  id: 'id',
  vi: 'vi',
  ro: 'ro',
};
const localePattern = allLocales
  .slice()
  .sort((a, b) => b.length - a.length)
  .map((locale) => locale.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
  .join('|');
const delimiter = '__PDFCRAFT_SEGMENT_BREAK__';
const force = process.argv.includes('--force');
const dryRun = process.argv.includes('--dry-run');
const individual = process.argv.includes('--individual');
const normalizeOnly = process.argv.includes('--normalize-only');
const localeArg = process.argv.find((arg) => arg.startsWith('--locales='));
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const slugsArg = process.argv.find((arg) => arg.startsWith('--slugs='));
const limit = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : undefined;
const targetLocales = (localeArg ? localeArg.split('=')[1].split(',') : allLocales.filter((locale) => locale !== 'en'))
  .map((locale) => locale.trim())
  .filter(Boolean);
const targetSlugs = slugsArg
  ? new Set(slugsArg.split('=')[1].split(',').map((slug) => slug.trim()).filter(Boolean))
  : null;

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('.env.local not found');
    process.exit(1);
  }

  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = value;
  }
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'string') return JSON.parse(value);
  return value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function localizeInternalUrls(value, locale) {
  if (typeof value !== 'string') return value;
  return value.replace(new RegExp(`/(?:${localePattern})/(blog|tools)(?=/|[)#?\\s]|$)`, 'g'), `/${locale}/$1`);
}

function normalizeMarkdownLinks(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\]\s+\((\/)/g, ']($1');
}

function protectInternalUrls(value, locale, urls) {
  if (typeof value !== 'string') return value;

  return value.replace(/\]\((\/en\/(blog|tools)\/[^)]+)\)/g, (match, url) => {
    const index = urls.length;
    urls.push(localizeInternalUrls(url, locale));
    return `](PDFCRAFTURL${index})`;
  });
}

function restoreInternalUrls(value, urls) {
  if (typeof value !== 'string') return value;
  let restored = value;

  for (let index = urls.length - 1; index >= 0; index -= 1) {
    restored = restored.replace(new RegExp(`PDFCRAFT\\s*URL\\s*${index}(?!\\d)`, 'gi'), urls[index]);
  }

  return restored;
}

function splitMarkdown(content) {
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function makeChunks(segments, maxLength = 3000) {
  const chunks = [];
  let current = [];
  let currentLength = 0;

  for (const segment of segments) {
    const segmentLength = segment.length + delimiter.length + 4;
    if (current.length > 0 && currentLength + segmentLength > maxLength) {
      chunks.push(current);
      current = [];
      currentLength = 0;
    }
    current.push(segment);
    currentLength += segmentLength;
  }

  if (current.length > 0) chunks.push(current);
  return chunks;
}

async function translateRaw(text, targetLocale, attempt = 1) {
  const googleLocale = googleLocales[targetLocale];
  if (!googleLocale) throw new Error(`Unsupported target locale: ${targetLocale}`);

  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', googleLocale);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'EasyPDFNex blog localization script',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    await sleep(80);
    return Array.isArray(data?.[0]) ? data[0].map((part) => part[0]).join('') : '';
  } catch (error) {
    if (attempt >= 3) throw error;
    await sleep(500 * attempt);
    return translateRaw(text, targetLocale, attempt + 1);
  }
}

async function translateSegments(segments, targetLocale) {
  if (individual) {
    const translated = [];
    for (const segment of segments) {
      translated.push((await translateRaw(segment, targetLocale)).trim());
    }
    return translated;
  }

  const translated = [];
  const chunks = makeChunks(segments);

  for (const chunk of chunks) {
    const joined = chunk.join(`\n\n${delimiter}\n\n`);
    const result = await translateRaw(joined, targetLocale);
    const parts = result.split(delimiter).map((part) => part.trim());

    if (parts.length === chunk.length) {
      for (let i = 0; i < parts.length; i += 1) {
        if (parts[i] === chunk[i] && /[A-Za-z]{4,}/.test(chunk[i])) {
          translated.push((await translateRaw(chunk[i], targetLocale)).trim());
        } else {
          translated.push(parts[i]);
        }
      }
      continue;
    }

    for (const segment of chunk) {
      translated.push((await translateRaw(segment, targetLocale)).trim());
    }
  }

  return translated;
}

function normalizeTranslatedMarkdown(content) {
  return normalizeMarkdownLinks(content
    .replace(/^[＃]{1,6}/gm, (match) => '#'.repeat(match.length))
    .replace(/^(#{1,6})(?![#\s])/gm, '$1 '));
}

function normalizeTranslation(translation, locale) {
  const normalized = { ...translation };
  for (const field of ['title', 'content', 'excerpt', 'metaTitle', 'metaDescription', 'focusKeywords']) {
    normalized[field] = localizeInternalUrls(normalizeMarkdownLinks(normalized[field]), locale);
  }
  if (typeof normalized.content === 'string') {
    normalized.content = normalizeTranslatedMarkdown(normalized.content);
  }
  return normalized;
}

function shouldTranslate(current, english) {
  if (force) return true;
  if (!current?.title || !current?.content) return true;
  if (current.title === english.title) return true;
  if (current.content.includes('## Quick answer')) return true;
  if (current.content.includes('/en/blog/') || current.content.includes('/en/tools/')) return true;
  return false;
}

async function translatePost(english, locale) {
  const contentSegments = splitMarkdown(english.content);
  const protectedUrls = [];
  const fieldSegments = [
    english.title,
    english.excerpt,
    english.metaTitle,
    english.metaDescription,
    english.focusKeywords,
    ...contentSegments,
  ].map((segment) => protectInternalUrls(segment, locale, protectedUrls));
  const translated = await translateSegments(fieldSegments, locale);
  const [title, excerpt, metaTitle, metaDescription, focusKeywords, ...translatedContent] = translated
    .map((segment) => restoreInternalUrls(segment, protectedUrls));

  return {
    title: localizeInternalUrls(title, locale),
    slug: english.slug,
    content: localizeInternalUrls(normalizeTranslatedMarkdown(translatedContent.join('\n\n')), locale),
    excerpt: localizeInternalUrls(excerpt, locale),
    metaTitle: localizeInternalUrls(metaTitle, locale),
    metaDescription: localizeInternalUrls(metaDescription, locale),
    focusKeywords: localizeInternalUrls(focusKeywords, locale),
  };
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function translateBlogLocales() {
  const invalidLocales = targetLocales.filter((locale) => locale === 'en' || !allLocales.includes(locale));
  if (invalidLocales.length > 0) throw new Error(`Invalid target locales: ${invalidLocales.join(', ')}`);

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true);

  if (error) throw error;

  const rows = Number.isInteger(limit) ? (data || []).slice(0, limit) : (data || []);
  const today = new Date().toISOString().split('T')[0];
  let translatedCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    const translations = parseJson(row.translations, {});
    const english = translations.en;
    if (!english?.slug || !english?.content) {
      skippedCount += 1;
      console.log(`Skipped row without English translation: ${row.id}`);
      continue;
    }
    if (targetSlugs && !targetSlugs.has(english.slug)) continue;

    let changed = false;
    for (const locale of targetLocales) {
      if (normalizeOnly) {
        if (!translations[locale]) {
          skippedCount += 1;
          continue;
        }

        const normalized = normalizeTranslation(translations[locale], locale);
        if (JSON.stringify(normalized) === JSON.stringify(translations[locale])) {
          skippedCount += 1;
          continue;
        }

        translations[locale] = normalized;
        translatedCount += 1;
        changed = true;
        console.log(`Normalized ${locale}: ${english.title}`);
        continue;
      }

      if (!shouldTranslate(translations[locale], english)) {
        skippedCount += 1;
        console.log(`Skipped ${locale}: ${english.title}`);
        continue;
      }

      console.log(`Translating ${locale}: ${english.title}`);
      translations[locale] = await translatePost(english, locale);
      translatedCount += 1;
      changed = true;
    }

    if (!changed || dryRun) continue;

    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        translations: JSON.stringify(translations),
        updated_at: today,
      })
      .eq('id', row.id);

    if (updateError) throw updateError;
    console.log(`Saved: ${english.title}`);
  }

  console.log(`\nComplete. Translated ${translatedCount} locale-post entries. Skipped ${skippedCount}.`);
}

translateBlogLocales().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
