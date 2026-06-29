import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const locales = ['en', 'ja', 'ko', 'es', 'fr', 'de', 'zh', 'zh-TW', 'pt', 'ar', 'it', 'id', 'vi', 'ro'];
const localePattern = locales
  .slice()
  .sort((a, b) => b.length - a.length)
  .map((locale) => locale.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
  .join('|');
const dryRun = process.argv.includes('--dry-run');

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

function localizeInternalUrls(value, locale) {
  if (typeof value !== 'string') return value;
  return value.replace(new RegExp(`/(?:${localePattern})/(blog|tools)/`, 'g'), `/${locale}/$1/`);
}

function localizeTranslation(base, locale) {
  return {
    ...base,
    slug: base.slug,
    content: localizeInternalUrls(base.content, locale),
    excerpt: localizeInternalUrls(base.excerpt, locale),
    metaTitle: localizeInternalUrls(base.metaTitle, locale),
    metaDescription: localizeInternalUrls(base.metaDescription, locale),
    focusKeywords: localizeInternalUrls(base.focusKeywords, locale),
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

async function replicateBlogLocales() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true);

  if (error) throw error;

  const rows = data || [];
  const today = new Date().toISOString().split('T')[0];
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const translations = parseJson(row.translations, {});
    const english = translations.en;

    if (!english?.slug || !english?.content) {
      skipped += 1;
      console.log(`Skipped row without English translation: ${row.id}`);
      continue;
    }

    for (const locale of locales) {
      translations[locale] = localizeTranslation(english, locale);
    }

    if (dryRun) {
      updated += 1;
      console.log(`[dry-run] Would replicate: ${english.title}`);
      continue;
    }

    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        translations: JSON.stringify(translations),
        updated_at: today,
      })
      .eq('id', row.id);

    if (updateError) throw updateError;

    updated += 1;
    console.log(`Replicated: ${english.title}`);
  }

  console.log(`\nComplete. Replicated ${updated} posts across ${locales.length} locales. Skipped ${skipped} posts.`);
}

replicateBlogLocales().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
