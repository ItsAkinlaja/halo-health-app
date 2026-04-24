const sharp = require('sharp');
const { logger } = require('../utils/logger');

class OCRService {
  async extractText(imageBuffer) {
    try {
      logger.info('OCR text extraction requested');
      
      // Preprocess image for better OCR results
      const preprocessedBuffer = await this.preprocessImage(imageBuffer);
      
      // Placeholder for actual OCR engine call (e.g., Tesseract, Google Vision)
      // For now, we simulate the OCR result from the preprocessed image
      const extractedText = await this.performOCR(preprocessedBuffer);
      
      return extractedText;
    } catch (error) {
      logger.error('Error extracting text from image:', error);
      throw error;
    }
  }

  async performOCR(imageBuffer) {
    // In production, you would call:
    // const { data: { text } } = await Tesseract.recognize(imageBuffer);
    // OR call Google Vision API / AWS Textract
    
    return `ORGANIC QUINOA
Ingredients: organic quinoa
Nutrition Facts:
Serving Size: 1/4 cup (45g)
Calories: 170
Protein: 6g
Carbohydrates: 31g
Fiber: 3g
Sugar: 0g
Fat: 2.5g
Sodium: 5mg

Certified Organic by USDA
Product of Bolivia`;
  }

  /**
   * Optimizes image for OCR by handling lighting, noise, and contrast
   */
  async preprocessImage(imageBuffer) {
    try {
      logger.info('Preprocessing image for OCR...');
      
      let pipeline = sharp(imageBuffer);
      
      // 1. Convert to grayscale to remove color noise
      pipeline = pipeline.grayscale();
      
      // 2. Enhance contrast and normalize lighting
      // This helps with poor lighting conditions
      pipeline = pipeline.normalize().linear(1.2, -20); // Increase contrast slightly
      
      // 3. Sharpen the image to make text edges clearer
      pipeline = pipeline.sharpen();
      
      // 4. Thresholding (optional, but good for pure black/white text)
      // pipeline = pipeline.threshold(128); 
      
      // 5. Resize if too small (OCR works better on larger text)
      const metadata = await pipeline.metadata();
      if (metadata.width < 1000) {
        pipeline = pipeline.resize(2000, null, { fit: 'inside', withoutEnlargement: false });
      }

      const processedBuffer = await pipeline.toBuffer();
      logger.info('Image preprocessing complete');
      
      return processedBuffer;
    } catch (error) {
      logger.error('Error during image preprocessing:', error);
      return imageBuffer; // Fallback to original buffer
    }
  }

  async validateImage(imageBuffer) {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Invalid image: empty buffer');
    }
    
    try {
      const metadata = await sharp(imageBuffer).metadata();
      const validFormats = ['jpeg', 'png', 'webp', 'tiff'];
      
      if (!validFormats.includes(metadata.format)) {
        throw new Error(`Unsupported image format: ${metadata.format}`);
      }
      
      logger.info(`Image validated: ${metadata.format}, ${metadata.width}x${metadata.height}`);
      return true;
    } catch (error) {
      logger.error('Image validation failed:', error);
      throw new Error('Failed to validate image format');
    }
  }

  async extractStructuredData(imageBuffer) {
    try {
      await this.validateImage(imageBuffer);
      const extractedText = await this.extractText(imageBuffer);
      return this.structureOCRText(extractedText);
    } catch (error) {
      logger.error('Error extracting structured data:', error);
      throw error;
    }
  }

  structureOCRText(rawText) {
    // Basic text structuring
    const lines = rawText.split('\n').filter(line => line.trim());
    
    const structured = {
      rawText: rawText,
      lines: lines,
      potentialProductName: null,
      potentialBrand: null,
      ingredients: [],
      nutritionInfo: {},
    };

    // Try to extract product name (usually first non-empty line)
    for (const line of lines) {
      if (line.length > 3 && !line.toLowerCase().includes('ingredients') && 
          !line.toLowerCase().includes('nutrition') && !line.toLowerCase().includes('serving')) {
        structured.potentialProductName = line.trim();
        break;
      }
    }

    // Try to extract ingredients section
    const ingredientsSection = lines.find(line => 
      line.toLowerCase().includes('ingredients')
    );
    
    if (ingredientsSection) {
      const ingredientsIndex = lines.indexOf(ingredientsSection);
      const ingredientsLine = lines[ingredientsIndex + 1];
      if (ingredientsLine) {
        structured.ingredients = ingredientsLine
          .split(',')
          .map(ing => ing.trim())
          .filter(ing => ing.length > 0);
      }
    }

    // Try to extract basic nutrition info
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('calories')) {
        const match = line.match(/(\d+)/);
        if (match) structured.nutritionInfo.calories = parseInt(match[1]);
      }
      if (lowerLine.includes('protein')) {
        const match = line.match(/(\d+)g/);
        if (match) structured.nutritionInfo.protein = parseInt(match[1]);
      }
      if (lowerLine.includes('carbohydrate')) {
        const match = line.match(/(\d+)g/);
        if (match) structured.nutritionInfo.carbs = parseInt(match[1]);
      }
      if (lowerLine.includes('fat')) {
        const match = line.match(/(\d+)g/);
        if (match) structured.nutritionInfo.fat = parseInt(match[1]);
      }
    });

    return structured;
  }
}

module.exports = new OCRService();
