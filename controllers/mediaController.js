const fs = require('fs');
const path = require('path');
const upload = require('../utils/upload');
const { processImage } = require('../utils/imageProcessor');

const mediaController = {
  // 上传图片
  uploadImage: (req, res) => {
    upload.array('images', 5)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ code: 400, message: err.message });
      }
      
      try {
        const images = req.files.map(file => {
          return {
            filename: file.filename,
            path: `/uploads/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype
          };
        });
        
        res.json({ code: 0, message: '上传成功', data: images });
      } catch (error) {
        res.status(500).json({ code: 500, message: '服务器内部错误' });
      }
    });
  },
  
  // 处理图片
  async processImage(req, res) {
    try {
      const { imagePath, width, height, rotate, quality, format } = req.body;
      const fullPath = path.join(__dirname, '../', imagePath);
      
      const processedPath = await processImage(fullPath, { width, height, rotate, quality, format });
      const relativePath = `/uploads/${path.basename(processedPath)}`;
      
      res.json({ code: 0, message: '处理成功', data: { path: relativePath } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 删除图片
  async deleteImage(req, res) {
    try {
      const { imagePath } = req.body;
      const fullPath = path.join(__dirname, '../', imagePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 获取图片列表
  async getImages(req, res) {
    try {
      const uploadDir = path.join(__dirname, '../uploads');
      const files = fs.readdirSync(uploadDir);
      
      const images = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
      }).map(file => {
        return {
          filename: file,
          path: `/uploads/${file}`,
          size: fs.statSync(path.join(uploadDir, file)).size
        };
      });
      
      res.json({ code: 0, message: '获取成功', data: images });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  }
};

module.exports = mediaController;