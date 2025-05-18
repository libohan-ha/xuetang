import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Layout from '@/components/Layout';
import { RecognitionResult, categorizeGI } from '@/types';
import { handleFoodRecognition } from '@/services/api';
import { Check, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";

const RecognitionPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    // Load last result from sessionStorage if available
    const lastResult = sessionStorage.getItem('lastResult');
    if (lastResult) {
      try {
        setResult(JSON.parse(lastResult));
      } catch (error) {
        console.error('Error parsing last result:', error);
      }
    }
  }, []);
  
  // Function to handle image selection
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResult(null); // Clear previous result
    
    try {
      // Create preview URL for selected image
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      
      const recognitionResult = await handleFoodRecognition(file);
      if (recognitionResult) {
        setResult(recognitionResult);
        toast({
          title: "识别成功",
          description: `成功识别: ${recognitionResult.food}`,
          duration: 3000,
        });
      } else {
        // No recognition result or unknown food
        setSelectedImage(null);
        toast({
          title: "识别失败",
          description: "无法识别食物，请尝试其他图片",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Recognition failed:', error);
      toast({
        title: "识别失败",
        description: "网络异常，请稍后重试",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle camera capture
  const handleCameraCapture = () => {
    // In a real implementation, this would open the camera
    // For this demo, we'll just simulate by clicking the file input
    document.getElementById("image-upload")?.click();
  };

  // Function to get progress bar color based on GI
  const getProgressBarColor = (gi: number): string => {
    if (gi < 55) return "bg-green-500"; // Low GI - green
    if (gi < 70) return "bg-yellow-500"; // Medium GI - yellow
    return "bg-red-500"; // High GI - red
  };

  // Function to estimate nutritional content based on GI (simplified estimation)
  const estimateNutrientLevel = (gi: number): string => {
    if (gi < 40) return "高";
    if (gi < 65) return "中";
    return "低";
  }
  
  // Function to estimate carb content based on GI
  const estimateCarbLevel = (gi: number): string => {
    if (gi > 70) return "高";
    if (gi > 55) return "中";
    return "低";
  }
  
  // Function to estimate protein content based on GI
  const estimateProteinLevel = (gi: number): string => {
    if (gi < 40) return "高";
    if (gi < 60) return "中";
    return "低";
  }
  
  // Function to estimate fiber content based on GI
  const estimateFiberLevel = (gi: number): string => {
    if (gi < 40) return "高";
    if (gi < 60) return "中";
    return "低";
  }

  return (
    <Layout title="食物升糖指数识别">
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        <Card className="w-full bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-center">
              {selectedImage && result ? (
                <div className="w-full relative">
                  <img 
                    src={selectedImage} 
                    alt="识别的食物" 
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  <Button 
                    className="mt-4 w-full py-2 text-sm bg-primary hover:bg-primary/90 transition-all"
                    onClick={handleCameraCapture}
                  >
                    重新拍照或选择图片
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full py-8 text-lg bg-primary hover:bg-primary/90 transition-all"
                  disabled={isLoading} 
                  onClick={handleCameraCapture}
                >
                  {isLoading ? '识别中...' : '拍照或者相册选择'}
                </Button>
              )}
              <input 
                type="file" 
                id="image-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageSelect}
              />
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className="w-full overflow-hidden border border-green-200 shadow-lg">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-green-800">{result.food}</h2>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  result.gi < 55 ? 'bg-green-100 text-green-800' : 
                  result.gi < 70 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  <span>GI: {result.gi}</span>
                  <span className="ml-1">({categorizeGI(result.gi)})</span>
                </div>
              </div>

              {/* GI Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">升糖指数 (GI)</span>
                  <span className="font-medium">{result.gi}/100</span>
                </div>
                <Progress 
                  value={result.gi} 
                  className="h-2"
                  indicatorClassName={getProgressBarColor(result.gi)}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>低 (≤55)</span>
                  <span>中 (56-69)</span>
                  <span>高 (≥70)</span>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-sm font-medium text-green-800 mb-2">营养成分估算</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-white rounded-md shadow-sm">
                    <div className="text-xs text-gray-500">碳水</div>
                    <div className="text-sm font-semibold">{result.nutrition?.carbs || estimateCarbLevel(result.gi)}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-md shadow-sm">
                    <div className="text-xs text-gray-500">蛋白质</div>
                    <div className="text-sm font-semibold">{result.nutrition?.protein || estimateProteinLevel(result.gi)}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-md shadow-sm">
                    <div className="text-xs text-gray-500">纤维素</div>
                    <div className="text-sm font-semibold">{result.nutrition?.fiber || estimateFiberLevel(result.gi)}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-md shadow-sm">
                    <div className="text-xs text-gray-500">脂肪</div>
                    <div className="text-sm font-semibold">{result.nutrition?.fat || estimateNutrientLevel(result.gi)}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-4 bg-green-50 rounded-lg border border-green-100">
                <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{result.suggestion}</p>
              </div>
              
              {result.confidence && result.confidence < 0.6 && (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-200 text-sm">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    结果置信度较低，建议手动确认
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-green-50 px-6 py-3 border-t border-green-100">
              <Button 
                variant="outline"
                className="w-full border-green-300 hover:bg-green-100" 
                onClick={() => {
                  // In a real app, this would implement system share functionality
                  navigator.clipboard.writeText(
                    `食物：${result.food}\n升糖指数：${result.gi}\n${result.suggestion}`
                  ).then(() => {
                    toast({
                      title: "复制成功",
                      description: "结果已复制到剪贴板",
                      duration: 3000,
                    });
                  }).catch(err => {
                    console.error('无法复制到剪贴板:', err);
                  });
                }}
              >
                分享/复制结果
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default RecognitionPage;
