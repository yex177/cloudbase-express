const path = require('path');

const processImage = async (imagePath, options = {}) => {
  // 简单返回原始图片路径，不进行处理
  return imagePath;
};

module.exports = {
  processImage
};