const sharp = require('sharp');
const path = require('path');

const processImage = async (imagePath, options = {}) => {
  const {
    width,
    height,
    rotate = 0,
    quality = 80,
    format = 'jpeg'
  } = options;

  try {
    let image = sharp(imagePath);

    // 旋转图片
    if (rotate) {
      image = image.rotate(rotate);
    }

    // 调整尺寸
    if (width || height) {
      image = image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // 转换格式并压缩
    const outputPath = path.join(
      path.dirname(imagePath),
      `${path.basename(imagePath, path.extname(imagePath))}-processed.${format}`
    );

    await image.toFormat(format, {
      quality: quality
    }).toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('图片处理失败:', error);
    throw error;
  }
};

module.exports = {
  processImage
};