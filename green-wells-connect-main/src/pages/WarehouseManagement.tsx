import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { 
  Package, 
  TrendingDown, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Minus,
  History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface InventoryItem {
  id: string;
  cylinder_size: string;
  current_stock: number;
  minimum_threshold: number;
  reorder_quantity: number;
  last_restock_date: string;
  total_sold: number;
}

const WarehouseManagement = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockHistory, setStockHistory] = useState<{ date: string; "6KG": number; "13KG": number; "35KG": number }[]>([]);

  const fetchInventory = async () => {
    try {
      // Simulate inventory data (in production, this would come from database)
      const mockInventory: InventoryItem[] = [
        {
          id: "1",
          cylinder_size: "6KG",
          current_stock: 45,
          minimum_threshold: 20,
          reorder_quantity: 50,
          last_restock_date: "2025-10-20",
          total_sold: 127,
        },
        {
          id: "2",
          cylinder_size: "13KG",
          current_stock: 15,
          minimum_threshold: 30,
          reorder_quantity: 100,
          last_restock_date: "2025-10-18",
          total_sold: 245,
        },
        {
          id: "3",
          cylinder_size: "35KG",
          current_stock: 8,
          minimum_threshold: 10,
          reorder_quantity: 20,
          last_restock_date: "2025-10-22",
          total_sold: 78,
        },
      ];

      setInventory(mockInventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load inventory data";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    generateStockHistory();
    const interval = setInterval(fetchInventory, 60000);
    return () => clearInterval(interval);
  }, []);

  const generateStockHistory = () => {
    // Generate mock stock history for the past week
    const history = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        "6KG": 50 - Math.floor(Math.random() * 10),
        "13KG": 80 - Math.floor(Math.random() * 30),
        "35KG": 15 - Math.floor(Math.random() * 5),
      });
    }
    
    setStockHistory(history);
  };

  const adjustStock = async (itemId: string, adjustment: number) => {
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;

      const newStock = Math.max(0, item.current_stock + adjustment);
      
      // Update inventory
      setInventory(prev => 
        prev.map(i => 
          i.id === itemId 
            ? { ...i, current_stock: newStock }
            : i
        )
      );

      toast({
        title: "Stock Updated",
        description: `${item.cylinder_size} stock ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)}`,
      });

      // Check if reorder is needed
      if (newStock < item.minimum_threshold) {
        triggerAutoReorder(item);
      }
    } catch (error) {
      console.error("Error adjusting stock:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update stock";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const triggerAutoReorder = (item: InventoryItem) => {
    toast({
      title: "Auto-Reorder Triggered",
      description: `Reordering ${item.reorder_quantity} units of ${item.cylinder_size} cylinders`,
    });

    // Simulate reorder process
    setTimeout(() => {
      setInventory(prev =>
        prev.map(i =>
          i.id === item.id
            ? {
                ...i,
                current_stock: i.current_stock + item.reorder_quantity,
                last_restock_date: new Date().toISOString().split('T')[0],
              }
            : i
        )
      );
      
      toast({
        title: "Restock Complete",
        description: `Added ${item.reorder_quantity} units of ${item.cylinder_size}`,
      });
    }, 2000);
  };

  const manualReorder = (item: InventoryItem) => {
    triggerAutoReorder(item);
  };

  const getStockStatus = (current: number, threshold: number) => {
    const percentage = (current / threshold) * 100;
    if (percentage <= 50) return { status: "critical", color: "destructive", icon: AlertTriangle };
    if (percentage <= 100) return { status: "low", color: "warning", icon: TrendingDown };
    return { status: "good", color: "success", icon: CheckCircle2 };
  };

  const totalStock = inventory.reduce((sum, item) => sum + item.current_stock, 0);
  const lowStockItems = inventory.filter(item => item.current_stock < item.minimum_threshold).length;
  const totalSold = inventory.reduce((sum, item) => sum + item.total_sold, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20 md:pb-0 md:pt-16">
      <Navbar />
      <div className="container mx-auto p-4 max-w-7xl pt-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Warehouse Management
          </h1>
          <p className="text-muted-foreground">Inventory tracking and automated reordering</p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground mt-1">Cylinders in stock</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground mt-1">Need reordering</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Sold</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSold}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time sales</p>
            </CardContent>
          </Card>
        </div>

        {/* Stock History Chart */}
        <Card className="mb-8 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Stock Level History
            </CardTitle>
            <CardDescription>Past 7 days inventory levels</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="6KG" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="13KG" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="35KG" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Items */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Current Inventory</h2>
          {inventory.map((item) => {
            const stockStatus = getStockStatus(item.current_stock, item.minimum_threshold);
            const stockPercentage = (item.current_stock / item.minimum_threshold) * 100;
            const StatusIcon = stockStatus.icon;

            return (
              <Card key={item.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {item.cylinder_size} Cylinder
                      </CardTitle>
                      <CardDescription>
                        Last restocked: {new Date(item.last_restock_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={stockStatus.status === "critical" ? "destructive" : "default"}
                      className="flex items-center gap-1"
                    >
                      <StatusIcon className="h-3 w-3" />
                      {stockStatus.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stock Level Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stock Level</span>
                      <span className="font-medium">
                        {item.current_stock} / {item.minimum_threshold} units
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          stockStatus.status === "critical"
                            ? "bg-red-500"
                            : stockStatus.status === "low"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(100, stockPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stock Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Stock</p>
                      <p className="text-xl font-bold">{item.current_stock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Min. Threshold</p>
                      <p className="text-xl font-bold">{item.minimum_threshold}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reorder Qty</p>
                      <p className="text-xl font-bold">{item.reorder_quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sold</p>
                      <p className="text-xl font-bold">{item.total_sold}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustStock(item.id, -1)}
                      disabled={item.current_stock === 0}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Decrease
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustStock(item.id, 1)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Increase
                    </Button>
                    <Button
                      size="sm"
                      className="ml-auto"
                      onClick={() => manualReorder(item)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reorder Now
                    </Button>
                  </div>

                  {/* Auto-reorder Alert */}
                  {item.current_stock < item.minimum_threshold && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Stock below minimum threshold. Auto-reorder will trigger at next check.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WarehouseManagement;
