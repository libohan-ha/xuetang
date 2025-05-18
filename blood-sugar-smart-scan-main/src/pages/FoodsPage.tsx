
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { FoodItem, GICategory } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FoodsPage: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GICategory>("全部");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  useEffect(() => {
    // Fetch foods data from JSON file
    fetch('/static/foods.json')
      .then(response => response.json())
      .then(data => {
        setFoods(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading foods data:', error);
        setIsLoading(false);
      });
  }, []);

  const handleCategoryChange = (category: GICategory) => {
    setSelectedCategory(category);
  };

  const filteredFoods = selectedCategory === "全部" 
    ? foods 
    : foods.filter(food => {
        if (selectedCategory === "低GI") return food.gi < 55;
        if (selectedCategory === "中GI") return food.gi >= 55 && food.gi < 70;
        if (selectedCategory === "高GI") return food.gi >= 70;
        return true;
      });

  const openFoodDetail = (food: FoodItem) => {
    setSelectedFood(food);
  };

  return (
    <Layout title="食物库">
      <div className="py-4">
        <div className="flex space-x-2 overflow-x-auto pb-4">
          {["全部", "低GI", "中GI", "高GI"].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleCategoryChange(category as GICategory)}
            >
              {category}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-gray-500">加载中...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredFoods.map((food) => (
              <Card 
                key={food.name} 
                className="overflow-hidden cursor-pointer"
                onClick={() => openFoodDetail(food)}
              >
                <div className="h-32 bg-gray-200 relative">
                  <img 
                    src={food.image} 
                    alt={food.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium">{food.name}</h3>
                    <span 
                      className={`text-sm px-2 py-0.5 rounded-full ${
                        food.gi < 55 ? 'bg-green-100 text-green-800' : 
                        food.gi < 70 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      GI: {food.gi}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{food.description}</p>
                </CardContent>
              </Card>
            ))}

            {filteredFoods.length === 0 && (
              <div className="col-span-2 py-8 text-center text-gray-500">
                未找到相关食物
              </div>
            )}
          </div>
        )}

        <Dialog open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
          <DialogContent>
            {selectedFood && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedFood.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="h-48 bg-gray-200 rounded overflow-hidden">
                    <img 
                      src={selectedFood.image} 
                      alt={selectedFood.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold">升糖指数 (GI): {selectedFood.gi}</span>
                    <span 
                      className={`px-2 py-1 rounded-full text-sm ${
                        selectedFood.gi < 55 ? 'bg-green-100 text-green-800' : 
                        selectedFood.gi < 70 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedFood.gi < 55 ? '低GI' : selectedFood.gi < 70 ? '中GI' : '高GI'}
                    </span>
                  </div>
                  <p>{selectedFood.description}</p>
                  
                  <div className="pt-2">
                    <h4 className="font-medium mb-1">食用建议</h4>
                    <p className="text-gray-700 text-sm">
                      {selectedFood.gi < 55 ? 
                        '低GI食物缓慢释放葡萄糖，是血糖控制的理想选择。' : 
                        selectedFood.gi < 70 ? 
                        '中GI食物适量食用，搭配蛋白质和纤维食物一起食用更佳。' : 
                        '高GI食物会导致血糖快速上升，建议少量食用并与蛋白质、脂肪和纤维共同食用。'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default FoodsPage;
