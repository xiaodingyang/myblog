const express = require('express');
const router = express.Router();
const { Article, Category } = require('../models');

const SITE_URL = (process.env.FRONTEND_URL || 'https://www.xiaodingyang.art')
  .split(',')[0]
  .trim()
  .replace(/\/+$/, '');
const SITE_TITLE = '若风的博客';
const SITE_DESC = '若风的个人技术博客，专注前端开发，分享 React、TypeScript、Node.js 等技术文章与实践经验。';

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripMarkdown(md) {
  return String(md || '')
    .replace(/#+\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\n/g, ' ')
    .trim();
}

// RSS 2.0 Feed
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .select('title summary content createdAt updatedAt category')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const now = new Date().toUTCString();

    let items = '';
    for (const a of articles) {
      const link = `${SITE_URL}/article/${a._id}`;
      const desc = escapeXml(stripMarkdown(a.summary || a.content).substring(0, 200));
      const pubDate = new Date(a.createdAt).toUTCString();
      items += `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${desc}</description>
      ${a.category ? `<category>${escapeXml(a.category.name)}</category>` : ''}
      <pubDate>${pubDate}</pubDate>
    </item>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/rss/" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=300'); // 5 分钟缓存
    res.send(xml);
  } catch (error) {
    console.error('RSS feed generation error:', error);
    res.status(500).send('Error generating RSS feed');
  }
});

// Atom 1.0 Feed
router.get('/atom', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .select('title summary content createdAt updatedAt category')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const now = new Date().toISOString();

    let entries = '';
    for (const a of articles) {
      const link = `${SITE_URL}/article/${a._id}`;
      const desc = escapeXml(stripMarkdown(a.summary || a.content).substring(0, 200));
      const updated = new Date(a.updatedAt || a.createdAt).toISOString();
      entries += `
  <entry>
    <title>${escapeXml(a.title)}</title>
    <link href="${link}" rel="alternate" type="text/html"/>
    <id>${link}</id>
    <updated>${updated}</updated>
    <summary>${desc}</summary>
  </entry>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_TITLE)}</title>
  <link href="${SITE_URL}" rel="alternate" type="text/html"/>
  <link href="${SITE_URL}/api/rss/atom" rel="self" type="application/atom+xml"/>
  <id>${SITE_URL}/</id>
  <updated>${now}</updated>
  <subtitle>${escapeXml(SITE_DESC)}</subtitle>
  ${entries}
</feed>`;

    res.set('Content-Type', 'application/atom+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=300');
    res.send(xml);
  } catch (error) {
    console.error('Atom feed generation error:', error);
    res.status(500).send('Error generating Atom feed');
  }
});

module.exports = router;
