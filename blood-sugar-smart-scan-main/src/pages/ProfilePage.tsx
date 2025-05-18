import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BloodGlucoseRecord } from '@/types';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as echarts from 'echarts';

// Mock blood glucose records
const initialRecords: BloodGlucoseRecord[] = [
  { value: 5.8, ts: Date.now() - 1000 * 60 * 60 * 24 * 2 }, // 2 days ago
  { value: 7.2, ts: Date.now() - 1000 * 60 * 60 * 24 * 1.5 }, // 1.5 days ago
  { value: 6.5, ts: Date.now() - 1000 * 60 * 60 * 24 }, // 1 day ago
  { value: 5.9, ts: Date.now() - 1000 * 60 * 60 * 12 }, // 12 hours ago
  { value: 6.7, ts: Date.now() - 1000 * 60 * 60 * 4 }, // 4 hours ago
];

const ProfilePage: React.FC = () => {
  const [records, setRecords] = useState<BloodGlucoseRecord[]>([]);
  const [newValue, setNewValue] = useState<number>(5.5);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BloodGlucoseRecord | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // Load from localStorage only
    const storedRecords = localStorage.getItem('bloodGlucoseRecords');
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    } else {
      setRecords([]);
    }
  }, []);

  // Initialize and update chart when records change
  useEffect(() => {
    // Initialize chart
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      // Filter for last 3 days of data
      const threeDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 3;
      const recentRecords = records.filter(record => record.ts >= threeDaysAgo)
        .sort((a, b) => a.ts - b.ts); // Ensure chronological order
      
      // Format data for bar chart - using simple values now, not pairs
      const formattedData = recentRecords.map(record => record.value);
      
      // Format x-axis labels with time
      const xAxisLabels = recentRecords.map(record => {
        const date = new Date(record.ts);
        return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      });
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            // Type safety handling for echarts tooltips
            if (Array.isArray(params) && params.length > 0) {
              const index = params[0].dataIndex;
              if (index >= 0 && index < recentRecords.length) {
                const record = recentRecords[index];
                const date = new Date(record.ts);
                return `${date.toLocaleString()}<br/>${record.value} mmol/L`;
              }
            }
            return '';
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisLabels,
          axisLabel: {
            rotate: 45,
            interval: 0 // Force show all labels
          },
          axisLine: {
            lineStyle: {
              color: '#4caf50'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#4caf50'
            }
          },
          min: function(value) {
            return Math.max(0, value.min - 1); // Start from 0 or slightly below min
          }
        },
        series: [
          {
            data: formattedData,
            type: 'bar',
            barWidth: recentRecords.length > 10 ? '80%' : '60%', // Adjust bar width based on data points
            itemStyle: {
              color: function(params) {
                // Color bars based on value - high values are redder
                const value = params.value;
                if (value >= 7.0) {
                  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#f44336' },
                    { offset: 1, color: '#e57373' }
                  ]);
                } else if (value >= 6.0) {
                  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#ff9800' },
                    { offset: 1, color: '#ffb74d' }
                  ]);
                } else {
                  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#4caf50' },
                    { offset: 1, color: '#81c784' }
                  ]);
                }
              },
              borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            },
            label: {
              show: recentRecords.length <= 5, // Show value labels if few data points
              position: 'top',
              formatter: '{c} mmol/L'
            }
          }
        ]
      };
      
      chartInstance.current.setOption(option);
    }
    
    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [records]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const saveRecords = (updatedRecords: BloodGlucoseRecord[]) => {
    try {
      localStorage.setItem('bloodGlucoseRecords', JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      toast({
        title: "保存失败",
        description: "浏览器可能处于隐私模式",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleAddRecord = () => {
    if (newValue < 1 || newValue > 30) return;
    
    const newRecord: BloodGlucoseRecord = {
      value: newValue,
      ts: Date.now()
    };
    
    const updatedRecords = [...records, newRecord].sort((a, b) => a.ts - b.ts);
    saveRecords(updatedRecords);
    
    setIsDrawerOpen(false);
    toast({
      title: "记录成功",
      description: `已添加血糖值: ${newValue}`,
      duration: 3000,
    });
  };

  const handleEditRecord = () => {
    if (!editingRecord || editingRecord.value < 1 || editingRecord.value > 30) return;
    
    const updatedRecords = records.map(r => 
      r.ts === editingRecord.ts ? editingRecord : r
    ).sort((a, b) => a.ts - b.ts);
    
    saveRecords(updatedRecords);
    setEditingRecord(null);
    setIsDrawerOpen(false);
    
    toast({
      title: "修改成功",
      description: `已更新血糖值: ${editingRecord.value}`,
      duration: 3000,
    });
  };

  const handleDeleteRecord = () => {
    if (recordToDelete === null) return;
    
    const updatedRecords = records.filter((_, index) => index !== recordToDelete);
    saveRecords(updatedRecords);
    
    setDeleteConfirmOpen(false);
    setRecordToDelete(null);
    
    toast({
      title: "删除成功",
      description: "记录已删除",
      duration: 3000,
    });
  };

  // Calculate statistics for the last 72 hours
  const last72Hours = records.filter(r => r.ts > Date.now() - 1000 * 60 * 60 * 72);
  const avgValue = last72Hours.length 
    ? (last72Hours.reduce((sum, r) => sum + r.value, 0) / last72Hours.length).toFixed(1) 
    : '0';
  const minValue = last72Hours.length 
    ? Math.min(...last72Hours.map(r => r.value)).toFixed(1) 
    : '0';
  const maxValue = last72Hours.length 
    ? Math.max(...last72Hours.map(r => r.value)).toFixed(1) 
    : '0';

  const initiateEditRecord = (record: BloodGlucoseRecord) => {
    setEditingRecord(record);
    setNewValue(record.value);
    setIsDrawerOpen(true);
  };
  
  const initiateDeleteRecord = (index: number) => {
    setRecordToDelete(index);
    setDeleteConfirmOpen(true);
  };

  return (
    <Layout title="我的记录">
      <div className="py-4 space-y-6">
        <Card className="border-green-200 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
          <CardContent className="pt-6">
            <div className="mb-2 text-sm text-gray-500 text-center">最近3天血糖记录</div>
            <div 
              ref={chartRef} 
              className="w-full" 
              style={{ height: '240px' }}
            ></div>
            {records.length === 0 && (
              <div className="flex items-center justify-center h-48 text-gray-500">
                暂无数据，请添加血糖记录
              </div>
            )}
            {records.length > 0 && records.filter(r => r.ts >= Date.now() - 1000 * 60 * 60 * 24 * 3).length === 0 && (
              <div className="flex items-center justify-center h-48 text-gray-500 absolute top-0 left-0 right-0 bottom-0 bg-white/80">
                最近3天没有血糖记录
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Card className="border-green-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-gray-500">最近3天平均</div>
              <div className="text-xl font-bold text-green-700">{avgValue}</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-gray-500">最近3天最低</div>
              <div className="text-xl font-bold text-green-600">{minValue}</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-gray-500">最近3天最高</div>
              <div className="text-xl font-bold text-red-500">{maxValue}</div>
            </CardContent>
          </Card>
        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button className="w-full py-6 text-lg bg-primary hover:bg-primary/90">记录血糖</Button>
          </DrawerTrigger>
          <DrawerContent className="bg-white">
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle className="text-center">{editingRecord ? "修改血糖记录" : "添加血糖记录"}</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 pb-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">血糖值 (mmol/L)</label>
                    <input
                      type="number"
                      value={editingRecord ? editingRecord.value : newValue}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (editingRecord) {
                          setEditingRecord({...editingRecord, value: val});
                        } else {
                          setNewValue(val);
                        }
                      }}
                      min="1"
                      max="30"
                      step="0.1"
                      className="mt-1 w-full rounded-md border border-green-200 p-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    />
                    <div className="text-xs text-gray-500 mt-1">范围: 1-30 mmol/L</div>
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90" 
                    onClick={editingRecord ? handleEditRecord : handleAddRecord}
                  >
                    {editingRecord ? "保存修改" : "保存记录"}
                  </Button>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <Card className="border-green-200 shadow-md">
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-1"></div>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2 text-green-800">历史记录</h3>
            <div className="space-y-2">
              {[...records].reverse().map((record, index) => (
                <div key={index} className="flex justify-between items-center border-b border-green-100 pb-2 hover:bg-green-50 rounded-md p-2">
                  <div>
                    <div className="font-medium text-green-900">{record.value} mmol/L</div>
                    <div className="text-xs text-gray-500">
                      {new Date(record.ts).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => initiateEditRecord(record)} 
                      className="p-1.5 rounded-md text-green-600 hover:bg-green-200 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => initiateDeleteRecord(records.length - 1 - index)} 
                      className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  暂无记录
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除记录</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条血糖记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRecord}
              className="bg-red-500 hover:bg-red-600"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ProfilePage;
