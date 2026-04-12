const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\34662\\Desktop\\work\\myblog\\frontend';
const desktopHtml = fs.readFileSync(path.join(dir, 'code-split-desktop.report.html'), 'utf8');
const mobileHtml = fs.readFileSync(path.join(dir, 'code-split-mobile.report.html'), 'utf8');

const desktopMatch = desktopHtml.match(/"categories":\{"performance":\{[^}]*"score":([0-9.]+)/);
const mobileMatch = mobileHtml.match(/"categories":\{"performance":\{[^}]*"score":([0-9.]+)/);

console.log('Desktop Performance Score:', desktopMatch ? Math.round(desktopMatch[1] * 100) : 'N/A');
console.log('Mobile Performance Score:', mobileMatch ? Math.round(mobileMatch[1] * 100) : 'N/A');
