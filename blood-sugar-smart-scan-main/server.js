import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure OpenAI with DashScope API
const apiKey = process.env.DASHSCOPE_API_KEY || 'your_api_key_here';
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// Log API configuration status
if (apiKey === 'your_api_key_here') {
  console.warn('\n⚠️  WARNING: Using placeholder API key. Please set DASHSCOPE_API_KEY in your .env file for actual API requests.\n');
}

// In-memory storage for multer (not saving files to disk)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Endpoint for image analysis
app.post('/api/analyze-food', upload.single('image'), async (req, res) => {
  try {
    let imageData;
    
    // Check if image comes as base64 in JSON body
    if (req.body.image) {
      imageData = req.body.image;
      // Remove potential data URL prefix
      if (imageData.includes('base64,')) {
        imageData = imageData.split('base64,')[1];
      }
    } 
    // Or check if image comes as file upload
    else if (req.file) {
      imageData = req.file.buffer.toString('base64');
    } else {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    // Prepare prompt for the model
    const prompt = `分析这张食物图片，并提供以下信息，必须按照要求的数据结构返回结果：
1. 食物名称
2. 血糖生成指数(GI)数值
3. 营养成分估算（用"高"、"中"、"低"表示）
4. 对糖尿病或关注血糖人群的饮食建议

请以JSON格式返回，格式如下：
{
  "foodName": "食物名称",
  "giValue": 数值,
  "nutrition": {
    "carbs": "低/中/高",
    "protein": "低/中/高",
    "fiber": "低/中/高",
    "fat": "低/中/高"
  },
  "recommendations": "饮食建议"
}

如果无法识别食物，请返回：
{
  "foodName": "未知食物",
  "giValue": 50,
  "nutrition": {
    "carbs": "中",
    "protein": "中",
    "fiber": "中",
    "fat": "中"
  },
  "recommendations": "无饮食建议"
}

请务必使用这些确切的键名（foodName, giValue, nutrition, recommendations等），不要更改。`;

    // Call the Qwen VL model via OpenAI compatible API
    const response = await openai.chat.completions.create({
      model: "qwen-vl-max", 
      messages: [
        { 
          role: "user", 
          content: [
            { type: "text", text: prompt },
            { 
              type: "image_url", 
              image_url: { url: `data:image/jpeg;base64,${imageData}` }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = response.choices[0].message.content;
    let parsedResult;

    try {
      parsedResult = JSON.parse(result);
      res.json(parsedResult);
    } catch (error) {
      // If the model didn't return proper JSON, send the raw text
      console.error("Failed to parse JSON response:", error);
      res.json({ 
        raw: result,
        error: "The model didn't return proper JSON. See raw response."
      });
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.message
    });
  }
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 