import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { MapPin, Package, Clock, CheckCircle2, Loader2, TruckIcon, PhoneCall, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  cylinder_size: string;
  delivery_address: string;
  delivery_status: string;
  payment_status: string;
  total_cost: number;
  created_at: string;
  preferred_time_slot: string;
  latitude: number | null;
  longitude: number | null;
}

interface TrackingData {
  driver_latitude: number;
  driver_longitude: number;
  estimated_time: string;
  status: string;
  updated_at?: string;
}

const Tracking = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<Record<string, TrackingData>>({});

  // Calculate distance between two coordinates (in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    fetchOrders();
    setupRealtimeSubscription();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your orders",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('order-tracking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_tracking'
        },
        (payload) => {
          console.log('Tracking update:', payload);
          if (payload.new && typeof payload.new === 'object') {
            const newTracking = payload.new as any;
            setTrackingData(prev => ({
              ...prev,
              [newTracking.order_id]: {
                driver_latitude: newTracking.driver_latitude,
                driver_longitude: newTracking.driver_longitude,
                estimated_time: newTracking.estimated_time,
                status: newTracking.status,
              }
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order update:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_transit":
        return "bg-blue-600";
      case "delivered":
        return "bg-green-600";
      case "confirmed":
        return "bg-purple-600";
      case "pending":
        return "bg-yellow-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getProgress = (status: string) => {
    switch (status) {
      case "pending":
        return 25;
      case "confirmed":
        return 50;
      case "in_transit":
        return 75;
      case "delivered":
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background pb-20 md:pb-0 md:pt-16">
      <Navbar />
      <div className="container mx-auto p-4 max-w-4xl pt-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Track Your Orders
          </h1>
          <p className="text-muted-foreground">Real-time updates on your delivery status</p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const tracking = trackingData[order.id];
            const progress = getProgress(order.delivery_status);
            const distance = tracking && order.latitude && order.longitude
              ? calculateDistance(
                  tracking.driver_latitude,
                  tracking.driver_longitude,
                  order.latitude,
                  order.longitude
                )
              : null;

            return (
              <Card key={order.id} className="shadow-lg hover:shadow-xl transition-all border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Package className="h-5 w-5 text-primary" />
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="font-medium">{order.cylinder_size} Cylinder</span>
                        <span>•</span>
                        <span>KES {order.total_cost.toLocaleString()}</span>
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(order.delivery_status)} text-white px-3 py-1`}>
                      {getStatusText(order.delivery_status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Delivery Status Timeline */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>Delivery Progress</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {[
                        { status: 'pending', label: 'Pending', icon: Clock },
                        { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
                        { status: 'in_transit', label: 'In Transit', icon: TruckIcon },
                        { status: 'delivered', label: 'Delivered', icon: Package }
                      ].map((stage, index) => {
                        const isActive = getProgress(stage.status) <= progress;
                        const Icon = stage.icon;
                        return (
                          <div 
                            key={stage.status}
                            className={`flex flex-col items-center text-center p-2 rounded-lg transition-all ${
                              isActive 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
                            <span className="text-xs font-medium">{stage.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">Time Slot</p>
                        <p className="text-sm text-muted-foreground">{order.preferred_time_slot}</p>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Tracking Info */}
                  {tracking && order.delivery_status === "in_transit" && (
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Navigation className="h-5 w-5 text-primary animate-pulse" />
                        <h3 className="font-semibold text-primary">Live Tracking Active</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Driver Location</p>
                          <p className="text-sm font-mono">
                            {tracking.driver_latitude.toFixed(4)}, {tracking.driver_longitude.toFixed(4)}
                          </p>
                        </div>
                        
                        {distance !== null && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Distance to You</p>
                            <p className="text-sm font-semibold text-primary">
                              ~{distance.toFixed(1)} km away
                            </p>
                          </div>
                        )}
                        
                        {tracking.estimated_time && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Estimated Arrival</p>
                            <p className="text-sm font-semibold text-accent">
                              {tracking.estimated_time}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <p className="text-sm font-medium capitalize">{tracking.status}</p>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 w-full"
                        onClick={() => {
                          if (order.latitude && order.longitude) {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&origin=${tracking.driver_latitude},${tracking.driver_longitude}&destination=${order.latitude},${order.longitude}`,
                              '_blank'
                            );
                          }
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </Button>
                    </div>
                  )}

                  {/* Order Delivered Status */}
                  {order.delivery_status === "delivered" && (
                    <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-primary">Successfully Delivered!</p>
                        <p className="text-sm text-muted-foreground">Thank you for your order</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Pending Warning */}
                  {order.payment_status === "pending" && (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <PhoneCall className="h-5 w-5 text-yellow-800 dark:text-yellow-200 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Payment Pending
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          Please complete M-Pesa payment to confirm your order
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Order Date */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Ordered on {new Date(order.created_at).toLocaleString('en-KE', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {orders.length === 0 && (
          <Card className="text-center py-16 shadow-lg">
            <CardContent>
              <Package className="h-20 w-20 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6">Start your first order to track your delivery</p>
              <Button onClick={() => window.location.href = '/order'}>
                Place Your First Order
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tracking;
