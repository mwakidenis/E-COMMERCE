import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Package, MapPin, CreditCard, Loader2, Info, Clock, CheckCircle2, Phone } from "lucide-react";
import { calculateOrderPrice, type DynamicPrice } from "@/utils/dynamicPricing";

const Order = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cylinderSize, setCylinderSize] = useState("13KG");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timeSlot, setTimeSlot] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState<DynamicPrice | null>(null);
  // Multi-step order flow: select product -> confirm details -> redirect to tracking
  const [orderStep, setOrderStep] = useState<"select" | "confirm">("select");

  const prices = {
    "6KG": 950,
    "13KG": 1850,
    "35KG": 4200,
  };

  const cylinderInfo = {
    "6KG": {
      image: "/images/cylinder-6kg.svg",
      name: "6 KG Cylinder",
      description: "Perfect for small families",
      color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      badge: "bg-green-600"
    },
    "13KG": {
      image: "/images/cylinder-13kg.svg",
      name: "13 KG Cylinder",
      description: "Most popular choice",
      color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
      badge: "bg-blue-600"
    },
    "35KG": {
      image: "/images/cylinder-35kg.svg",
      name: "35 KG Cylinder",
      description: "For commercial use",
      color: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
      badge: "bg-orange-600"
    }
  };

  const totalCost = dynamicPrice?.totalPrice || prices[cylinderSize as keyof typeof prices];

  // Calculate dynamic price when location or cylinder size changes
  useEffect(() => {
    if (latitude && longitude) {
      const price = calculateOrderPrice(cylinderSize, latitude, longitude);
      setDynamicPrice(price);
    }
  }, [cylinderSize, latitude, longitude]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setAddress(`Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`);
          setGettingLocation(false);
          toast({
            title: "Location Found",
            description: "Your current location has been set",
          });
        },
        (error) => {
          setGettingLocation(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive",
          });
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setGettingLocation(false);
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!address || !timeSlot || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to place an order",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          cylinder_size: cylinderSize,
          delivery_address: address,
          latitude,
          longitude,
          preferred_time_slot: timeSlot,
          total_cost: totalCost,
          payment_status: "pending",
          delivery_status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      console.log("Order created:", order);

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "mpesa-payment",
        {
          body: {
            orderId: order.id,
            amount: totalCost,
            phoneNumber,
          },
        }
      );

      if (paymentError) throw paymentError;

      console.log("Payment response:", paymentData);

      toast({
        title: "Payment Request Sent!",
        description: "Please check your phone and enter your M-Pesa PIN",
      });

      setTimeout(() => {
        navigate("/tracking");
      }, 3000);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background pb-20 md:pb-0 md:pt-16">
      <Navbar />
      <div className="container mx-auto p-4 max-w-6xl pt-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Place Your Order
          </h1>
          <p className="text-muted-foreground">Choose your cylinder and get it delivered to your doorstep</p>
        </div>

        <Tabs value={orderStep} onValueChange={(v) => setOrderStep(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="select" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Select Product</span>
              <span className="sm:hidden">Select</span>
            </TabsTrigger>
            <TabsTrigger value="confirm" disabled={!cylinderSize} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Confirm & Pay</span>
              <span className="sm:hidden">Confirm</span>
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Select Cylinder */}
          <TabsContent value="select" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Object.keys(cylinderInfo) as Array<keyof typeof cylinderInfo>).map((size) => {
                const info = cylinderInfo[size];
                return (
                  <Card 
                    key={size}
                    className={`cursor-pointer transition-all hover:shadow-xl ${
                      cylinderSize === size 
                        ? `ring-2 ring-primary ${info.color}` 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => setCylinderSize(size)}
                  >
                    <CardHeader className="text-center pb-2">
                      {cylinderSize === size && (
                        <Badge className={`${info.badge} w-fit mx-auto mb-2`}>
                          Selected
                        </Badge>
                      )}
                      <div className="flex justify-center mb-4">
                        <img 
                          src={info.image} 
                          alt={info.name}
                          className="h-32 w-auto object-contain"
                        />
                      </div>
                      <CardTitle className="text-xl">{info.name}</CardTitle>
                      <CardDescription>{info.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        KES {prices[size].toLocaleString()}
                      </div>
                      <Button 
                        className="w-full mt-2"
                        variant={cylinderSize === size ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCylinderSize(size);
                        }}
                      >
                        {cylinderSize === size ? "Selected" : "Select"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Why Choose Us?
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Fast Delivery</h3>
                  <p className="text-sm text-muted-foreground">Same-day delivery available</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <MapPin className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Real-Time Tracking</h3>
                  <p className="text-sm text-muted-foreground">Track your delivery live</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Quality Assured</h3>
                  <p className="text-sm text-muted-foreground">100% genuine products</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                size="lg" 
                onClick={() => setOrderStep("confirm")}
                disabled={!cylinderSize}
                className="min-w-[200px]"
              >
                Continue to Delivery Details
              </Button>
            </div>
          </TabsContent>

          {/* Step 2: Confirm Details */}
          <TabsContent value="confirm" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Selected Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <img 
                      src={cylinderInfo[cylinderSize as keyof typeof cylinderInfo].image} 
                      alt={cylinderInfo[cylinderSize as keyof typeof cylinderInfo].name}
                      className="h-20 w-auto"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {cylinderInfo[cylinderSize as keyof typeof cylinderInfo].name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {cylinderInfo[cylinderSize as keyof typeof cylinderInfo].description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        KES {totalCost.toLocaleString()}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setOrderStep("select")}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                  <CardDescription>Where should we deliver your cylinder?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="address"
                        placeholder="Enter your delivery address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                        className="flex-shrink-0"
                      >
                        {gettingLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {latitude && longitude && (
                      <p className="text-xs text-muted-foreground">
                        Location captured: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time-slot">Preferred Delivery Time</Label>
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger id="time-slot">
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8am-10am">8:00 AM - 10:00 AM</SelectItem>
                        <SelectItem value="10am-12pm">10:00 AM - 12:00 PM</SelectItem>
                        <SelectItem value="12pm-2pm">12:00 PM - 2:00 PM</SelectItem>
                        <SelectItem value="2pm-4pm">2:00 PM - 4:00 PM</SelectItem>
                        <SelectItem value="4pm-6pm">4:00 PM - 6:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      M-Pesa Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      You'll receive an M-Pesa prompt to complete payment
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dynamicPrice && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-start gap-2 mb-3">
                        <Info className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-2">Price Breakdown</p>
                          {dynamicPrice.breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-medium">KES {item.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-lg font-medium">Total Amount:</span>
                    <span className="text-3xl font-bold text-primary">KES {totalCost.toLocaleString()}</span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setOrderStep("select")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={loading || !address || !timeSlot || !phoneNumber}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay with M-Pesa
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Order;
