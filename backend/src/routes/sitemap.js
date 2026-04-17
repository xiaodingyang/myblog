const express = require('express');
const router = express.Router();
const { Article, Category, Tag } = require('../models');

const SITE_URL = (process.env.FRONTEND_URL || 'https://www.xiaodingyang.art')
  .split(',')[0]
  .trim()
  .replace(/\/+$/, '');

router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .select('_id updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    const categories = await Category.find().select('_id updatedAt').lean();
    const tags = await Tag.find().select('_id updatedAt').lean();

    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
      { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${SITE_URL}/articles`, changefreq: 'daily', priority: '0.9' },
      { loc: `${SITE_URL}/categories`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${SITE_URL}/tags`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${SITE_URL}/message`, changefreq: 'weekly', priority: '0.5' },
      { loc: `${SITE_URL}/archives`, changefreq: 'weekly', priority: '0.7' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (const page of staticPages) {
      xml += `
  <url>
    <loc>${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    for (const article of articles) {
      const lastmod = article.updatedAt
        ? new Date(article.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${SITE_URL}/article/${article._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    for (const cat of categories) {
      const lastmod = cat.updatedAt ? new Date(cat.updatedAt).toISOString().split('T')[0] : today;
      xml += `
  <url>
    <loc>${SITE_URL}/category/${cat._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    for (const tag of tags) {
      const lastmod = tag.updatedAt ? new Date(tag.updatedAt).toISOString().split('T')[0] : today;
      xml += `
  <url>
    <loc>${SITE_URL}/tag/${tag._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    xml += '\n</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
