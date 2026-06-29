import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const locale = 'en';
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

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tools = {
  'add-watermark': {
    label: 'Add Watermark',
    description: 'Add text or image watermarks to mark ownership, draft status, or confidentiality.',
  },
  'change-permissions': {
    label: 'Change Permissions',
    description: 'Control printing, copying, editing, and other PDF permission settings.',
  },
  'compress-pdf': {
    label: 'Compress PDF',
    description: 'Reduce PDF file size while keeping documents readable and shareable.',
  },
  'crop-pdf': {
    label: 'Crop PDF',
    description: 'Trim margins, remove unwanted edges, and focus pages on the useful content area.',
  },
  'decrypt-pdf': {
    label: 'Decrypt PDF',
    description: 'Remove password protection from PDFs you own or are authorized to unlock.',
  },
  'digital-sign-pdf': {
    label: 'Digital Sign PDF',
    description: 'Apply certificate-based signatures for stronger document authenticity and integrity.',
  },
  'edit-pdf': {
    label: 'Edit PDF',
    description: 'Modify, annotate, and update PDF pages directly in your browser.',
  },
  'encrypt-pdf': {
    label: 'Encrypt PDF',
    description: 'Protect confidential documents with password-based encryption.',
  },
  'extract-pages': {
    label: 'Extract Pages',
    description: 'Pull specific pages out of a PDF into a separate file.',
  },
  'extract-tables': {
    label: 'Extract Tables',
    description: 'Capture structured table data from PDFs for analysis and reporting.',
  },
  'find-and-redact': {
    label: 'Find and Redact',
    description: 'Locate sensitive text and remove it permanently from a PDF.',
  },
  'fix-page-size': {
    label: 'Fix Page Size',
    description: 'Standardize mixed page sizes for cleaner document formatting.',
  },
  'form-creator': {
    label: 'Form Creator',
    description: 'Build interactive PDFs with text fields, checkboxes, dropdowns, and signatures.',
  },
  'form-filler': {
    label: 'Form Filler',
    description: 'Complete fillable PDF forms without desktop software.',
  },
  'header-footer': {
    label: 'Header Footer',
    description: 'Add consistent page headers, footers, dates, and labels.',
  },
  'image-to-pdf': {
    label: 'Image to PDF',
    description: 'Combine image files into a polished PDF document.',
  },
  'jpg-to-pdf': {
    label: 'JPG to PDF',
    description: 'Turn JPG photos, scans, and screenshots into PDF pages.',
  },
  'linearize-pdf': {
    label: 'Linearize PDF',
    description: 'Optimize PDFs for faster web viewing and delivery.',
  },
  'markdown-to-pdf': {
    label: 'Markdown to PDF',
    description: 'Convert structured markdown content into a formatted PDF.',
  },
  'merge-pdf': {
    label: 'Merge PDF',
    description: 'Combine multiple PDF files into one organized document.',
  },
  'ocr-pdf': {
    label: 'OCR PDF',
    description: 'Make scanned PDFs searchable with optical character recognition.',
  },
  'organize-pdf': {
    label: 'Organize PDF',
    description: 'Reorder, duplicate, delete, and arrange PDF pages visually.',
  },
  'page-dimensions': {
    label: 'Page Dimensions',
    description: 'Inspect page sizes and dimensions before cropping or resizing.',
  },
  'page-numbers': {
    label: 'Page Numbers',
    description: 'Add readable numbering to reports, packets, and long PDFs.',
  },
  'pdf-multi-tool': {
    label: 'PDF Multi Tool',
    description: 'Handle common PDF editing, organizing, and cleanup tasks in one workflow.',
  },
  'pdf-to-docx': {
    label: 'PDF to Word',
    description: 'Convert PDFs into editable DOCX files for text-heavy revisions.',
  },
  'pdf-to-excel': {
    label: 'PDF to Excel',
    description: 'Move tabular PDF data into spreadsheets for analysis.',
  },
  'pdf-to-jpg': {
    label: 'PDF to JPG',
    description: 'Export PDF pages as JPG images for sharing and publishing.',
  },
  'pdf-to-json': {
    label: 'PDF to JSON',
    description: 'Extract PDF content into structured data for workflows and apps.',
  },
  'pdf-to-markdown': {
    label: 'PDF to Markdown',
    description: 'Convert PDF text into structured markdown for reuse.',
  },
  'pdf-to-png': {
    label: 'PDF to PNG',
    description: 'Export PDF pages as high-quality PNG images.',
  },
  'pdf-to-webp': {
    label: 'PDF to WebP',
    description: 'Create smaller modern image exports from PDF pages.',
  },
  'remove-metadata': {
    label: 'Remove Metadata',
    description: 'Strip hidden document metadata before sharing PDFs externally.',
  },
  'remove-restrictions': {
    label: 'Remove Restrictions',
    description: 'Remove editing, printing, or copying limits when you have permission.',
  },
  'rotate-pdf': {
    label: 'Rotate PDF',
    description: 'Fix upside-down or sideways pages with precise rotation controls.',
  },
  'sanitize-pdf': {
    label: 'Sanitize PDF',
    description: 'Clean hidden data and risky content from PDFs before distribution.',
  },
  'sign-pdf': {
    label: 'Sign PDF',
    description: 'Add electronic signatures to PDF documents quickly.',
  },
  'split-pdf': {
    label: 'Split PDF',
    description: 'Divide a PDF into smaller files by page ranges or selected pages.',
  },
  'txt-to-pdf': {
    label: 'TXT to PDF',
    description: 'Convert plain text content into a portable PDF.',
  },
  'validate-signature': {
    label: 'Validate Signature',
    description: 'Check whether PDF signatures are valid and trusted.',
  },
};

const postTitles = {
  'add-digital-signature-to-pdf': 'How to Add a Digital Signature to a PDF Document',
  'add-watermarks-protect-pdf-documents': 'Add Watermarks to Protect Your PDF Documents',
  'batch-pdf-processing-save-time': 'Batch PDF Processing to Save Time and Boost Productivity',
  'complete-guide-merging-pdf-files-online': 'The Complete Guide to Merging PDF Files Online',
  'compress-pdf-without-losing-quality': 'How to Compress a PDF Without Losing Quality in 2026',
  'convert-html-to-pdf-web-pages': 'How to Convert HTML to PDF for Web Pages',
  'convert-jpg-to-pdf-step-by-step': 'Convert JPG to PDF: A Step by Step Guide',
  'create-fillable-pdf-forms-online': 'How to Create Fillable PDF Forms Online',
  'crop-pages-pdf-document': 'How to Crop Pages in a PDF Document',
  'edit-pdf-without-adobe-acrobat': 'How to Edit a PDF Without Adobe Acrobat',
  'extract-text-from-pdf-files': 'Extract Text From PDF Files Accurately',
  'ocr-pdf-make-searchable': 'How to OCR a PDF and Make It Searchable',
  'pdf-security-best-practices-2026': 'PDF Security Best Practices for 2026',
  'pdf-to-image-conversion-explained': 'PDF to Image Conversion Explained',
  'pdf-to-word-converter-best-tool': 'PDF to Word Converter: Which Tool is Best in 2026',
  'reduce-pdf-file-size-email': 'Reduce PDF File Size for Email Attachments',
  'remove-pdf-password-protection-online': 'Remove PDF Password Protection Online Free',
  'rotate-reorder-pdf-pages': 'How to Rotate and Reorder PDF Pages',
  'split-pdf-into-multiple-files': 'How to Split a PDF Into Multiple Files Easily',
  'top-pdf-tools-professionals-need-2026': 'Top PDF Tools Every Professional Needs in 2026',
};

const plans = {
  'compress-pdf-without-losing-quality': {
    relatedTools: ['compress-pdf', 'linearize-pdf', 'split-pdf'],
    relatedPosts: ['reduce-pdf-file-size-email', 'batch-pdf-processing-save-time', 'pdf-security-best-practices-2026'],
    quickAnswer: 'Use the [Compress PDF tool](/en/tools/compress-pdf) when you need a smaller file without rewriting the document. If the goal is email delivery, also read [reduce PDF file size for email attachments](/en/blog/reduce-pdf-file-size-email) for attachment-size targets and practical compression settings.',
  },
  'complete-guide-merging-pdf-files-online': {
    relatedTools: ['merge-pdf', 'organize-pdf', 'pdf-multi-tool'],
    relatedPosts: ['split-pdf-into-multiple-files', 'rotate-reorder-pdf-pages', 'batch-pdf-processing-save-time'],
    quickAnswer: 'Use the [Merge PDF tool](/en/tools/merge-pdf) to combine files, then use [Organize PDF](/en/tools/organize-pdf) if pages need to be rearranged before sharing. For the opposite workflow, see [how to split a PDF into multiple files](/en/blog/split-pdf-into-multiple-files).',
  },
  'split-pdf-into-multiple-files': {
    relatedTools: ['split-pdf', 'extract-pages', 'organize-pdf'],
    relatedPosts: ['complete-guide-merging-pdf-files-online', 'rotate-reorder-pdf-pages', 'reduce-pdf-file-size-email'],
    quickAnswer: 'Use the [Split PDF tool](/en/tools/split-pdf) to divide a document by page range, or use [Extract Pages](/en/tools/extract-pages) when you only need selected pages. If you later need one combined file again, follow the [PDF merging guide](/en/blog/complete-guide-merging-pdf-files-online).',
  },
  'convert-jpg-to-pdf-step-by-step': {
    relatedTools: ['jpg-to-pdf', 'image-to-pdf', 'pdf-to-jpg'],
    relatedPosts: ['pdf-to-image-conversion-explained', 'compress-pdf-without-losing-quality', 'complete-guide-merging-pdf-files-online'],
    quickAnswer: 'Use the [JPG to PDF tool](/en/tools/jpg-to-pdf) when your source files are JPG photos or scans. For mixed image formats, use [Image to PDF](/en/tools/image-to-pdf), then review [PDF to image conversion](/en/blog/pdf-to-image-conversion-explained) if you also need image exports later.',
  },
  'pdf-to-word-converter-best-tool': {
    relatedTools: ['pdf-to-docx', 'edit-pdf', 'ocr-pdf'],
    relatedPosts: ['edit-pdf-without-adobe-acrobat', 'extract-text-from-pdf-files', 'ocr-pdf-make-searchable'],
    quickAnswer: 'Use the [PDF to Word tool](/en/tools/pdf-to-docx) for editable DOCX output. If the PDF is scanned, run [OCR PDF](/en/tools/ocr-pdf) first, then compare the workflow with [editing a PDF without Adobe Acrobat](/en/blog/edit-pdf-without-adobe-acrobat).',
  },
  'add-digital-signature-to-pdf': {
    relatedTools: ['sign-pdf', 'digital-sign-pdf', 'validate-signature'],
    relatedPosts: ['pdf-security-best-practices-2026', 'create-fillable-pdf-forms-online', 'remove-pdf-password-protection-online'],
    quickAnswer: 'Use [Sign PDF](/en/tools/sign-pdf) for fast electronic signatures and [Digital Sign PDF](/en/tools/digital-sign-pdf) when you need stronger certificate-based validation. For secure document handling, pair this with the [PDF security best practices guide](/en/blog/pdf-security-best-practices-2026).',
  },
  'remove-pdf-password-protection-online': {
    relatedTools: ['decrypt-pdf', 'remove-restrictions', 'encrypt-pdf'],
    relatedPosts: ['pdf-security-best-practices-2026', 'add-digital-signature-to-pdf', 'edit-pdf-without-adobe-acrobat'],
    quickAnswer: 'Use [Decrypt PDF](/en/tools/decrypt-pdf) only for documents you own or are authorized to unlock. After removing restrictions, review [PDF security best practices](/en/blog/pdf-security-best-practices-2026) so future protected files remain secure and accessible.',
  },
  'edit-pdf-without-adobe-acrobat': {
    relatedTools: ['edit-pdf', 'pdf-to-docx', 'organize-pdf'],
    relatedPosts: ['pdf-to-word-converter-best-tool', 'rotate-reorder-pdf-pages', 'add-watermarks-protect-pdf-documents'],
    quickAnswer: 'Use [Edit PDF](/en/tools/edit-pdf) for direct edits, annotations, and page-level updates. For heavy text revisions, convert with [PDF to Word](/en/tools/pdf-to-docx) and compare the tradeoffs in the [PDF to Word converter guide](/en/blog/pdf-to-word-converter-best-tool).',
  },
  'batch-pdf-processing-save-time': {
    relatedTools: ['pdf-multi-tool', 'compress-pdf', 'merge-pdf'],
    relatedPosts: ['compress-pdf-without-losing-quality', 'complete-guide-merging-pdf-files-online', 'split-pdf-into-multiple-files'],
    quickAnswer: 'Use [PDF Multi Tool](/en/tools/pdf-multi-tool) for grouped PDF cleanup tasks, then use dedicated tools like [Compress PDF](/en/tools/compress-pdf) or [Merge PDF](/en/tools/merge-pdf) for focused workflows. Start with the [compression guide](/en/blog/compress-pdf-without-losing-quality) if file size is the main problem.',
  },
  'ocr-pdf-make-searchable': {
    relatedTools: ['ocr-pdf', 'pdf-to-docx', 'extract-tables'],
    relatedPosts: ['extract-text-from-pdf-files', 'pdf-to-word-converter-best-tool', 'batch-pdf-processing-save-time'],
    quickAnswer: 'Use [OCR PDF](/en/tools/ocr-pdf) to turn scanned pages into searchable text. If you need editable output afterward, continue with [PDF to Word](/en/tools/pdf-to-docx) and read [extract text from PDF files accurately](/en/blog/extract-text-from-pdf-files).',
  },
  'pdf-security-best-practices-2026': {
    relatedTools: ['encrypt-pdf', 'sanitize-pdf', 'remove-metadata'],
    relatedPosts: ['remove-pdf-password-protection-online', 'add-digital-signature-to-pdf', 'add-watermarks-protect-pdf-documents'],
    quickAnswer: 'Use [Encrypt PDF](/en/tools/encrypt-pdf) for access control, [Sanitize PDF](/en/tools/sanitize-pdf) before external sharing, and [Remove Metadata](/en/tools/remove-metadata) to reduce hidden data exposure. For signing workflows, read [how to add a digital signature to a PDF](/en/blog/add-digital-signature-to-pdf).',
  },
  'crop-pages-pdf-document': {
    relatedTools: ['crop-pdf', 'fix-page-size', 'page-dimensions'],
    relatedPosts: ['rotate-reorder-pdf-pages', 'edit-pdf-without-adobe-acrobat', 'pdf-to-image-conversion-explained'],
    quickAnswer: 'Use [Crop PDF](/en/tools/crop-pdf) to trim margins or remove unwanted page areas. If page sizes are inconsistent, inspect them with [Page Dimensions](/en/tools/page-dimensions) and then review [rotating and reordering PDF pages](/en/blog/rotate-reorder-pdf-pages).',
  },
  'pdf-to-image-conversion-explained': {
    relatedTools: ['pdf-to-jpg', 'pdf-to-png', 'pdf-to-webp'],
    relatedPosts: ['convert-jpg-to-pdf-step-by-step', 'crop-pages-pdf-document', 'compress-pdf-without-losing-quality'],
    quickAnswer: 'Use [PDF to JPG](/en/tools/pdf-to-jpg) for shareable image exports, [PDF to PNG](/en/tools/pdf-to-png) for sharper graphics, or [PDF to WebP](/en/tools/pdf-to-webp) for smaller web images. For the reverse workflow, read [convert JPG to PDF](/en/blog/convert-jpg-to-pdf-step-by-step).',
  },
  'rotate-reorder-pdf-pages': {
    relatedTools: ['rotate-pdf', 'organize-pdf', 'pdf-multi-tool'],
    relatedPosts: ['crop-pages-pdf-document', 'split-pdf-into-multiple-files', 'complete-guide-merging-pdf-files-online'],
    quickAnswer: 'Use [Rotate PDF](/en/tools/rotate-pdf) for orientation fixes and [Organize PDF](/en/tools/organize-pdf) when the page order needs to change. If you are preparing separate files, continue with [how to split a PDF into multiple files](/en/blog/split-pdf-into-multiple-files).',
  },
  'reduce-pdf-file-size-email': {
    relatedTools: ['compress-pdf', 'split-pdf', 'linearize-pdf'],
    relatedPosts: ['compress-pdf-without-losing-quality', 'split-pdf-into-multiple-files', 'batch-pdf-processing-save-time'],
    quickAnswer: 'Use [Compress PDF](/en/tools/compress-pdf) to target common email limits, then use [Split PDF](/en/tools/split-pdf) if the document still exceeds the recipient limit. For broader compression strategy, read [compress PDF without losing quality](/en/blog/compress-pdf-without-losing-quality).',
  },
  'create-fillable-pdf-forms-online': {
    relatedTools: ['form-creator', 'form-filler', 'sign-pdf'],
    relatedPosts: ['add-digital-signature-to-pdf', 'edit-pdf-without-adobe-acrobat', 'pdf-security-best-practices-2026'],
    quickAnswer: 'Use [Form Creator](/en/tools/form-creator) to add interactive fields, then use [Form Filler](/en/tools/form-filler) to test the form before sharing. If signatures are part of the workflow, read [how to add a digital signature to a PDF](/en/blog/add-digital-signature-to-pdf).',
  },
  'extract-text-from-pdf-files': {
    relatedTools: ['pdf-to-markdown', 'ocr-pdf', 'pdf-to-json'],
    relatedPosts: ['ocr-pdf-make-searchable', 'pdf-to-word-converter-best-tool', 'batch-pdf-processing-save-time'],
    quickAnswer: 'Use [PDF to Markdown](/en/tools/pdf-to-markdown) for reusable text structure, [OCR PDF](/en/tools/ocr-pdf) for scanned documents, or [PDF to JSON](/en/tools/pdf-to-json) for structured extraction. If the file is image-based, start with [how to OCR a PDF](/en/blog/ocr-pdf-make-searchable).',
  },
  'add-watermarks-protect-pdf-documents': {
    relatedTools: ['add-watermark', 'page-numbers', 'header-footer'],
    relatedPosts: ['pdf-security-best-practices-2026', 'edit-pdf-without-adobe-acrobat', 'add-digital-signature-to-pdf'],
    quickAnswer: 'Use [Add Watermark](/en/tools/add-watermark) to mark ownership, confidentiality, or draft status. For stronger protection, combine watermarking with the controls in [PDF security best practices](/en/blog/pdf-security-best-practices-2026).',
  },
  'convert-html-to-pdf-web-pages': {
    relatedTools: ['markdown-to-pdf', 'txt-to-pdf', 'pdf-to-markdown'],
    relatedPosts: ['pdf-to-image-conversion-explained', 'compress-pdf-without-losing-quality', 'top-pdf-tools-professionals-need-2026'],
    quickAnswer: 'EasyPDFNex does not expose a dedicated HTML-to-PDF tool yet, but you can convert structured content with [Markdown to PDF](/en/tools/markdown-to-pdf) or prepare text-based output with [TXT to PDF](/en/tools/txt-to-pdf). If the final PDF is large, use the [compression guide](/en/blog/compress-pdf-without-losing-quality).',
  },
  'top-pdf-tools-professionals-need-2026': {
    relatedTools: ['pdf-multi-tool', 'edit-pdf', 'compress-pdf'],
    relatedPosts: ['edit-pdf-without-adobe-acrobat', 'compress-pdf-without-losing-quality', 'pdf-security-best-practices-2026'],
    quickAnswer: 'Start with [PDF Multi Tool](/en/tools/pdf-multi-tool) for general document cleanup, [Edit PDF](/en/tools/edit-pdf) for direct changes, and [Compress PDF](/en/tools/compress-pdf) for sharing-ready output. For deeper guidance, read [how to edit a PDF without Adobe Acrobat](/en/blog/edit-pdf-without-adobe-acrobat).',
  },
};

function parseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'string') return JSON.parse(value);
  return value;
}

function removeGeneratedSections(content) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\n## Helpful resources[\s\S]*$/i, '')
    .replace(/\n## Quick answer\n\n[\s\S]*?(?=\n## |\n[A-Z][^\n]{2,90}\n\n|$)/i, '')
    .trim();
}

function isLikelyHeading(block) {
  const text = block.trim();
  if (!text || text.includes('\n')) return false;
  if (/^#{1,6}\s/.test(text)) return false;
  if (/^[-*]\s/.test(text)) return false;
  if (text.includes('](')) return false;
  if (/[.!?]$/.test(text)) return false;
  if (!/^[A-Z0-9]/.test(text)) return false;

  const words = text.split(/\s+/);
  if (text === 'Conclusion') return true;
  return text.length <= 90 && words.length >= 2 && words.length <= 10;
}

function formatBlock(block) {
  const trimmed = block.trim();
  if (isLikelyHeading(trimmed)) return `## ${trimmed}`;
  return trimmed;
}

function makeResourceSection(plan) {
  const toolItems = plan.relatedTools
    .map((slug) => {
      const tool = tools[slug];
      if (!tool) throw new Error(`Unknown tool slug: ${slug}`);
      return `- [${tool.label}](/en/tools/${slug}): ${tool.description}`;
    })
    .join('\n');

  const postItems = plan.relatedPosts
    .map((slug) => {
      const title = postTitles[slug];
      if (!title) throw new Error(`Unknown related post slug: ${slug}`);
      return `- [${title}](/en/blog/${slug})`;
    })
    .join('\n');

  return [
    '## Helpful resources',
    '### Related EasyPDFNex tools',
    toolItems,
    '### Related blog guides',
    postItems,
  ].join('\n\n');
}

function enrichContent(content, plan) {
  const cleaned = removeGeneratedSections(content);
  const blocks = cleaned.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  if (blocks.length === 0) return cleaned;

  const intro = blocks[0];
  const rest = blocks.slice(1).map(formatBlock);

  return [
    intro,
    '## Quick answer',
    plan.quickAnswer,
    ...rest,
    makeResourceSection(plan),
  ].join('\n\n');
}

async function updateBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true);

  if (error) throw error;

  const rows = data || [];
  let updated = 0;
  let skipped = 0;
  const today = new Date().toISOString().split('T')[0];

  for (const row of rows) {
    const translations = parseJson(row.translations, {});
    const translation = translations[locale];
    const slug = translation?.slug;
    const plan = plans[slug];

    if (!slug || !plan || !translation?.content) {
      skipped += 1;
      console.log(`Skipped: ${slug || row.id}`);
      continue;
    }

    translations[locale] = {
      ...translation,
      content: enrichContent(translation.content, plan),
    };

    if (dryRun) {
      updated += 1;
      console.log(`[dry-run] Would update: ${translation.title}`);
      continue;
    }

    const updatePayload = {
      translations: JSON.stringify(translations),
      related_tools: JSON.stringify(plan.relatedTools),
      updated_at: today,
    };

    let { error: updateError } = await supabase
      .from('blog_posts')
      .update(updatePayload)
      .eq('id', row.id);

    if (updateError?.message?.includes("'related_tools' column")) {
      const { related_tools: _relatedTools, ...fallbackPayload } = updatePayload;
      const fallbackResult = await supabase
        .from('blog_posts')
        .update(fallbackPayload)
        .eq('id', row.id);
      updateError = fallbackResult.error;
    }

    if (updateError) throw updateError;

    updated += 1;
    console.log(`Updated: ${translation.title}`);
  }

  console.log(`\nComplete. Updated ${updated} posts. Skipped ${skipped} posts.`);
}

updateBlogPosts().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
