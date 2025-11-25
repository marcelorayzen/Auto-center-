const sharpModule = await import('sharp');
const sharp = sharpModule.default || sharpModule;
const pngToIcoModule = await import('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;
import fs from 'fs/promises';
import path from 'path';

const proj = path.resolve('.');
const publicDir = path.join(proj, 'public');
const iconsDir = path.join(publicDir, 'icons');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  await ensureDir(iconsDir);
  const src = path.join(publicDir, 'source-icon.jpeg');

  try {
    // generate PNG icons with sharp
    await sharp(src).resize(192, 192, { fit: 'cover' }).toFile(path.join(iconsDir, 'icon-192.png'));
    await sharp(src).resize(512, 512, { fit: 'cover' }).toFile(path.join(iconsDir, 'icon-512.png'));
    await sharp(src).resize(180, 180, { fit: 'cover' }).toFile(path.join(publicDir, 'apple-touch-icon.png'));

    const f32 = path.join(publicDir, 'favicon-32.png');
    const f16 = path.join(publicDir, 'favicon-16.png');
    await sharp(src).resize(32, 32, { fit: 'cover' }).toFile(f32);
    await sharp(src).resize(16, 16, { fit: 'cover' }).toFile(f16);

    // create multi-resolution favicon.ico from the two pngs
    const icoBuffer = await pngToIco([f16, f32]);
    await fs.writeFile(path.join(publicDir, 'favicon.ico'), icoBuffer);

    console.log('✅ Icons generated in', publicDir);
  } catch (err) {
    console.error('Failed to generate icons:', err);
    process.exit(1);
  }
}

main();
