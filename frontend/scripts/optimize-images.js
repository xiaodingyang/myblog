const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputDir = path.join(__dirname, '../public/images/articles');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 下载图片（处理重定向）
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`   Redirecting to: ${redirectUrl}`);
          downloadImage(redirectUrl, filename).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode === 200) {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ buffer, filename });
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// 优化图片：压缩并转换为 WebP
async function optimizeImage(buffer, outputPath) {
  await sharp(buffer)
    .resize(800, 420, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(outputPath);
  console.log(`✅ Generated: ${outputPath}`);
}

// 主函数
async function main() {
  console.log('🚀 Starting image optimization...\n');

  const images = [
    {
      url: 'https://picsum.photos/seed/default/1200/630',
      name: 'hero-default.webp',
    },
    {
      url: 'https://picsum.photos/seed/grayscale/1200/630?grayscale',
      name: 'hero-grayscale.webp',
    },
    {
      url: 'https://picsum.photos/seed/blur/1200/630?blur=2',
      name: 'hero-blur.webp',
    },
  ];

  for (const img of images) {
    try {
      console.log(`📥 Downloading: ${img.url}`);
      const { buffer } = await downloadImage(img.url, img.name);
      
      const outputPath = path.join(outputDir, img.name);
      await optimizeImage(buffer, outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
    } catch (error) {
      console.error(`❌ Error processing ${img.name}:`, error.message);
    }
  }

  console.log('✨ Image optimization complete!');
}

main().catch(console.error);
