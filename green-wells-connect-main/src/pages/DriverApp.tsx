import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { 
  MapPin, 
  Navigation, 
  Package, 
  CheckCircle2, 
  Clock,
  Phone,
  AlertCircle,
  TrendingUp,
  Fuel
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { optimizeRoute, type Location, type OptimizedRoute } from "@/utils/routeOptimization";

interface DeliveryOrder {
  id: string;
  cylinder_size: string;
  delivery_address: string;
  latitude: number;
  longitude: number;
  delivery_status: string;
  total_cost: number;
  created_at: string;
  phone_number?: string;
}

const DriverApp = () => {
  const { toast } = useToast();
  const [assignedOrders, setAssignedOrders] = useState<DeliveryOrder[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    completedToday: 0,
    earnings: 0,
  });

  const fetchAssignedOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view deliveries",
          variant: "destructive",
        });
        return;
      }

      // Fetch orders that are ready for delivery or in transit
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("delivery_status", ["confirmed", "in_transit"])
        .order("created_at", { ascending: true });

      if (error) throw error;

      setAssignedOrders(data || []);

      // Calculate stats
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayOrders = data?.filter(
        o => new Date(o.created_at) >= todayStart
      ) || [];

      const completedToday = todayOrders.filter(
        o => o.delivery_status === "delivered"
      ).length;

      const earnings = todayOrders
        .filter(o => o.delivery_status === "delivered")
        .reduce((sum, o) => sum + (o.total_cost * 0.1), 0); // 10% commission

      setStats({
        todayDeliveries: todayOrders.length,
        completedToday,
        earnings,
      });

    } catch (error) {
      console.error("Error fetching orders:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load deliveries";
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
    fetchAssignedOrders();
    const interval = setInterval(fetchAssignedOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculateOptimizedRoute = () => {
    const warehouseLocation: Location = {
      latitude: -1.2921, // Nairobi default warehouse
      longitude: 36.8219,
      address: "Green Wells Warehouse - Nairobi",
    };

    const deliveryLocations: Location[] = assignedOrders
      .filter(order => order.latitude && order.longitude)
      .map(order => ({
        latitude: order.latitude,
        longitude: order.longitude,
        address: order.delivery_address,
        orderId: order.id,
      }));

    if (deliveryLocations.length > 0) {
      const route = optimizeRoute(warehouseLocation, deliveryLocations);
      setOptimizedRoute(route);
    }
  };

  useEffect(() => {
    if (assignedOrders.length > 0) {
      calculateOptimizedRoute();
    }
  }, [assignedOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ delivery_status: status })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order marked as ${status}`,
      });

      fetchAssignedOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update order status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const startDelivery = (orderId: string) => {
    updateOrderStatus(orderId, "in_transit");
  };

  const completeDelivery = (orderId: string) => {
    updateOrderStatus(orderId, "delivered");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20 md:pb-0 md:pt-16">
      <Navbar />
      <div className="container mx-auto p-4 max-w-6xl pt-6">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Driver Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your deliveries efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.todayDeliveries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedToday} completed
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">KES {stats.earnings.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Commission earned</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{assignedOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending delivery</p>
            </CardContent>
          </Card>
        </div>

        {/* Optimized Route Card */}
        {optimizedRoute && optimizedRoute.locations.length > 1 && (
          <Card className="mb-6 border-primary/50 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Optimized Route
              </CardTitle>
              <CardDescription>AI-powered route to minimize time and fuel costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-bold">{optimizedRoute.totalDistance} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Time</p>
                    <p className="font-bold">{optimizedRoute.estimatedTime} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Cost</p>
                    <p className="font-bold">KES {optimizedRoute.estimatedFuelCost}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stops</p>
                    <p className="font-bold">{optimizedRoute.locations.length - 1}</p>
                  </div>
                </div>
              </div>

              {/* Route Sequence */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-3">Route Sequence:</h4>
                <div className="space-y-2">
                  {optimizedRoute.locations.map((location, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{location.address}</p>
                        {location.orderId && (
                          <p className="text-xs text-muted-foreground">
                            Order #{location.orderId.slice(0, 8)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Orders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Assigned Deliveries</h2>
          {assignedOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>{order.cylinder_size} Cylinder</CardDescription>
                  </div>
                  <Badge 
                    className={
                      order.delivery_status === "in_transit" 
                        ? "bg-secondary" 
                        : "bg-accent"
                    }
                  >
                    {order.delivery_status === "in_transit" ? "In Transit" : "Ready"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                  </div>
                </div>

                {order.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Customer Phone</p>
                      <p className="text-sm text-muted-foreground">{order.phone_number}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {order.delivery_status === "confirmed" && (
                    <Button 
                      onClick={() => startDelivery(order.id)}
                      className="flex-1"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Start Delivery
                    </Button>
                  )}
                  {order.delivery_status === "in_transit" && (
                    <Button 
                      onClick={() => completeDelivery(order.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete Delivery
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {assignedOrders.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No Active Deliveries</p>
                <p className="text-muted-foreground">Check back later for new assignments</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverApp;
