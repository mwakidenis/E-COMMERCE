import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { AlertTriangle, CheckCircle2, Shield, Flame, Wind, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SafetyHub = () => {
  const [serialNumber, setSerialNumber] = useState("");

  const safetyTips = [
    {
      icon: Flame,
      title: "Check for Gas Leaks",
      description: "Apply soapy water to connections. Bubbles indicate a leak.",
    },
    {
      icon: Wind,
      title: "Ventilation",
      description: "Ensure proper ventilation when using LPG appliances.",
    },
    {
      icon: Eye,
      title: "Regular Inspection",
      description: "Check hoses and connections regularly for wear and tear.",
    },
    {
      icon: AlertTriangle,
      title: "Emergency Procedures",
      description: "Know how to shut off gas supply in case of emergency.",
    },
  ];

  const handleRegister = () => {
    if (!serialNumber) {
      toast.error("Please enter a cylinder serial number");
      return;
    }
    toast.success("Cylinder registered successfully!");
    setSerialNumber("");
  };

  return (
    <div className="min-h-screen bg-muted pb-20 md:pb-0 md:pt-16">
      <Navbar />
      <div className="container mx-auto p-4 max-w-4xl pt-6">
        <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Safety Hub
        </h1>

        <Card className="mb-6 shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Register Your Cylinder
            </CardTitle>
            <CardDescription>
              Register your LPG cylinder for warranty and safety tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serial">Cylinder Serial Number</Label>
              <Input
                id="serial"
                placeholder="Enter serial number (e.g., CYL123456)"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleRegister}>
              Register Cylinder
            </Button>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Safety Tips</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {safetyTips.map((tip, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <tip.icon className="h-5 w-5 text-primary" />
                    {tip.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-destructive/10 border-destructive/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-2">24/7 Emergency Hotline</p>
            <a
              href="tel:+254700000000"
              className="text-2xl font-bold text-primary hover:underline"
            >
              +254 700 000 000
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              Call immediately if you suspect a gas leak or safety issue
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafetyHub;
