const express = require('express');
const router = express.Router();
const { Article, Category, Tag } = require('../models');

const SITE_URL = process.env.FRONTEND_URL || 'https://www.xiaodingyang.art';

router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .select('_id updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    const categories = await Category.find().select('_id').lean();
    const tags = await Tag.find().select('_id').lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/articles</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/tags</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/message</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;

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
      xml += `
  <url>
    <loc>${SITE_URL}/category/${cat._id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    for (const tag of tags) {
      xml += `
  <url>
    <loc>${SITE_URL}/tag/${tag._id}</loc>
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
