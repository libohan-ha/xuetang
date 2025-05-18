import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Loader2 } from 'lucide-react';

type AnalysisResult = {
  foodName?: string;
  giValue?: number | string;
  nutrition?: {
    calories?: number | string;
    protein?: number | string;
    fat?: number | string;
    carbs?: number | string;
    [key: string]: number | string | undefined;
  };
  recommendations?: string;
  [key: string]: number | string | undefined | Record<string, number | string | undefined>;
};

export default function FoodAnalyzer() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      // Reset previous results
      setAnalysisResult(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      setError('请先选择一张食物图片');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Read image as base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        // Send image to API
        const response = await fetch('/api/analyze-food', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
        });

        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status}`);
        }

        const data = await response.json();
        setAnalysisResult(data);
        setIsAnalyzing(false);
      };

      reader.onerror = () => {
        setError('读取图片失败');
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析过程中出错');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>食物营养智能分析</CardTitle>
          <CardDescription>
            上传食物图片，获取血糖生成指数(GI)和营养分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500">支持 JPG, PNG, WEBP 格式图片</p>
              </div>

              {imagePreview && (
                <div className="mt-4 relative rounded-md overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="预览图片" 
                    className="max-h-64 mx-auto object-contain"
                  />
                </div>
              )}

              <Button 
                onClick={analyzeImage} 
                disabled={!image || isAnalyzing}
                className="mt-4"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在分析中...
                  </>
                ) : '分析图片'}
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
                  {error}
                </div>
              )}
            </div>

            {analysisResult && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">分析结果</h3>
                
                {/* 食物名称 */}
                {analysisResult.foodName && (
                  <div className="mb-4">
                    <h4 className="text-base font-medium">食物名称</h4>
                    <p className="text-lg">{analysisResult.foodName}</p>
                  </div>
                )}
                
                {/* GI值 */}
                {analysisResult.giValue && (
                  <div className="mb-4">
                    <h4 className="text-base font-medium">血糖生成指数 (GI)</h4>
                    <p className="text-lg">{analysisResult.giValue}</p>
                    <p className="text-sm text-gray-500">
                      {Number(analysisResult.giValue) < 55 
                        ? '低GI (0-55): 血糖上升缓慢' 
                        : Number(analysisResult.giValue) < 70 
                          ? '中GI (56-69): 血糖上升中等' 
                          : '高GI (≥70): 血糖上升迅速'}
                    </p>
                  </div>
                )}
                
                {/* 营养成分 */}
                {analysisResult.nutrition && (
                  <div className="mb-4">
                    <h4 className="text-base font-medium">营养成分估算</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {analysisResult.nutrition.calories && (
                        <div className="p-2 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-500">卡路里</p>
                          <p>{analysisResult.nutrition.calories}</p>
                        </div>
                      )}
                      {analysisResult.nutrition.protein && (
                        <div className="p-2 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-500">蛋白质</p>
                          <p>{analysisResult.nutrition.protein}</p>
                        </div>
                      )}
                      {analysisResult.nutrition.fat && (
                        <div className="p-2 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-500">脂肪</p>
                          <p>{analysisResult.nutrition.fat}</p>
                        </div>
                      )}
                      {analysisResult.nutrition.carbs && (
                        <div className="p-2 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-500">碳水化合物</p>
                          <p>{analysisResult.nutrition.carbs}</p>
                        </div>
                      )}
                      {/* 显示其他可能的营养成分 */}
                      {Object.entries(analysisResult.nutrition)
                        .filter(([key]) => !['calories', 'protein', 'fat', 'carbs'].includes(key))
                        .map(([key, value]) => (
                          <div key={key} className="p-2 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-500">{key}</p>
                            <p>{value}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* 饮食建议 */}
                {analysisResult.recommendations && (
                  <div className="mb-4">
                    <h4 className="text-base font-medium">饮食建议</h4>
                    <p className="text-sm whitespace-pre-line">{analysisResult.recommendations}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-gray-500">
            图片仅用于分析，不会保存在服务器上
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 