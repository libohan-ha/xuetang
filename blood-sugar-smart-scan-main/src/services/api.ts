import { RecognitionResult } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Real API implementation using our backend
export async function recognizeFood(imageFile: File): Promise<RecognitionResult> {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Send to our backend API
    const response = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the API response into our RecognitionResult format
    const result = {
      food: data.foodName || '未知食物',
      gi: typeof data.giValue === 'number' ? data.giValue : 
          typeof data.giValue === 'string' ? parseInt(data.giValue, 10) : 50,
      suggestion: data.recommendations || '无饮食建议',
      nutrition: data.nutrition || {
        carbs: '中',
        protein: '中',
        fiber: '中',
        fat: '中'
      },
      confidence: 0.85 // We don't have confidence from the API, so use a default
    };
    
    // If food is unknown or default, return null to not display the card
    if (result.food === '未知食物' && !data.foodName) {
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error instanceof Error ? error.message : "网络异常，请稍后重试");
  }
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Function to handle food recognition with error handling
export async function handleFoodRecognition(file: File): Promise<RecognitionResult | null> {
  try {
    const result = await recognizeFood(file);
    
    // Check confidence level if available
    if (result.confidence && result.confidence < 0.6) {
      toast({
        title: "结果不确定",
        description: "建议手动确认食物信息",
        variant: "destructive",
      });
    }
    
    // Store in sessionStorage
    sessionStorage.setItem('lastResult', JSON.stringify(result));
    
    return result;
  } catch (error) {
    toast({
      title: "识别失败",
      description: error instanceof Error ? error.message : "网络异常，请稍后重试",
      variant: "destructive",
    });
    return null;
  }
}
