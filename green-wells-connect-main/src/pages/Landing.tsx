import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Package, MapPin, Shield, Clock, Zap, CheckCircle2, Smartphone, CreditCard, TrendingUp, Truck, Warehouse, Star, Users, Award, ChevronDown, Quote, Sparkles, MessageCircle, Headphones, BarChart3, Gift, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3); // Use fixed length instead of testimonials.length
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Smartphone className="h-12 w-12 text-primary" />,
      title: "Easy Mobile Ordering",
      description: "Order your LPG cylinder in seconds from anywhere, anytime using your smartphone"
    },
    {
      icon: <MapPin className="h-12 w-12 text-primary" />,
      title: "Real-Time GPS Tracking",
      description: "Track your delivery in real-time with live GPS updates and accurate ETAs"
    },
    {
      icon: <CreditCard className="h-12 w-12 text-primary" />,
      title: "M-Pesa Integration",
      description: "Secure and instant payments via M-Pesa - Kenya's most trusted payment platform"
    },
    {
      icon: <Clock className="h-12 w-12 text-primary" />,
      title: "Fast Delivery",
      description: "Get your LPG delivered within 30-60 minutes in most urban areas"
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: "Safety First",
      description: "Access safety guidelines, register cylinders, and get expert advice 24/7"
    },
    {
      icon: <Zap className="h-12 w-12 text-primary" />,
      title: "Dynamic Pricing",
      description: "Transparent pricing based on distance, demand, and time - always fair and competitive"
    },
    {
      icon: <Truck className="h-12 w-12 text-primary" />,
      title: "Smart Route Optimization",
      description: "AI-powered routing minimizes delivery time and reduces fuel costs"
    },
    {
      icon: <Warehouse className="h-12 w-12 text-primary" />,
      title: "Automated Inventory",
      description: "Real-time stock tracking with automated reordering ensures availability"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Quick sign-up with your phone number and basic details"
    },
    {
      number: "02",
      title: "Place Order",
      description: "Select cylinder size, delivery location, and preferred time slot"
    },
    {
      number: "03",
      title: "Pay via M-Pesa",
      description: "Secure payment through M-Pesa - instant confirmation"
    },
    {
      number: "04",
      title: "Track & Receive",
      description: "Watch your delivery in real-time and receive at your doorstep"
    }
  ];

  const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "50K+", label: "Deliveries Made" },
    { value: "30min", label: "Avg. Delivery Time" },
    { value: "99.8%", label: "Satisfaction Rate" }
  ];

  const testimonials = [
    {
      name: "Sarah Mwangi",
      role: "Resident, Nairobi",
      content: "Green Wells has completely changed how I order gas. The real-time tracking gives me peace of mind, and the delivery is always on time!",
      rating: 5
    },
    {
      name: "John Kamau",
      role: "Restaurant Owner",
      content: "As a business owner, I need reliable LPG supply. Green Wells never disappoints. Fast delivery and excellent customer service!",
      rating: 5
    },
    {
      name: "Grace Akinyi",
      role: "Homemaker, Mombasa",
      content: "I love the convenience and safety features. The M-Pesa payment is seamless, and I can track my delivery from my phone!",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "How fast is the delivery?",
      answer: "We typically deliver within 30-60 minutes in urban areas. Delivery time may vary based on your location and current demand."
    },
    {
      question: "Is it safe to order LPG online?",
      answer: "Absolutely! All our cylinders are safety-checked before delivery, and our drivers are trained and certified. We also provide cylinder registration and safety guidelines."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept M-Pesa payments for instant and secure transactions. Payment is processed immediately, and you'll receive a confirmation."
    },
    {
      question: "Can I track my delivery in real-time?",
      answer: "Yes! Once your order is dispatched, you can track your delivery driver's location in real-time through our app or website."
    },
    {
      question: "What if I need to cancel or reschedule?",
      answer: "You can cancel or reschedule your order before it's dispatched. Contact our 24/7 customer support for assistance."
    },
    {
      question: "Do you deliver to all areas in Kenya?",
      answer: "We currently serve major urban areas in Kenya. Enter your location when ordering to check if we deliver to your area."
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b z-50 transition-all duration-300" style={{ boxShadow: scrollY > 50 ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none" }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in-left">
            <Package className="h-8 w-8 text-primary animate-bounce-soft" />
            <span className="font-bold text-xl gradient-text">Green Wells</span>
          </div>
          <div className="flex items-center gap-4 animate-fade-in-right">
            <Link to="/login">
              <Button variant="ghost" className="hover:scale-105 transition-transform">Login</Button>
            </Link>
            <Link to="/login">
              <Button className="animate-pulse-glow hover:scale-105 transition-transform">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 min-h-[90vh] flex items-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }} />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-block animate-scale-in">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                🚀 Revolutionizing LPG Delivery in Kenya
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              LPG Delivery Made
              <br />
              <span className="gradient-text bg-gradient-to-r from-white to-primary-foreground">Simple, Safe & Smart</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              Order your cooking gas with a tap. Track your delivery in real-time. Pay securely with M-Pesa. 
              The future of LPG delivery is here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 hover:scale-105 transition-transform bg-white text-primary hover:bg-white/90 shadow-2xl">
                  Order Now →
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 glass-effect text-white border-white/30 hover:bg-white/20 hover:scale-105 transition-transform">
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 pt-8 animate-bounce-soft">
              <ChevronDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-background relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2 animate-counter">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Why Choose Green Wells SmartConnect?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're revolutionizing LPG delivery in Kenya with technology that puts you in control
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 opacity-0 animate-fade-in border-2 border-transparent hover:border-primary/20 overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: "linear-gradient(90deg, hsl(155 60% 35%) 1px, transparent 1px), linear-gradient(0deg, hsl(155 60% 35%) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your LPG delivered in 4 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="text-center space-y-4 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center mx-auto shadow-lg hover:shadow-2xl transition-shadow duration-300 hover:scale-110 transform transition-transform animate-pulse-glow">
                  <span className="text-4xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied customers across Kenya
            </p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                      <CardContent className="pt-8">
                        <div className="flex justify-center mb-4">
                          <Quote className="h-12 w-12 text-primary/20" />
                        </div>
                        <div className="flex justify-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                          ))}
                        </div>
                        <p className="text-lg text-center mb-6 italic">"{testimonial.content}"</p>
                        <div className="text-center">
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeTestimonial === index ? "bg-primary w-8" : "bg-primary/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-left">
              <h2 className="text-4xl md:text-5xl font-bold">
                Safe, Reliable & Always On Time
              </h2>
              <p className="text-lg text-muted-foreground">
                Green Wells SmartConnect combines cutting-edge technology with 
                traditional reliability to ensure you never run out of cooking gas.
              </p>
              <ul className="space-y-4">
                {[
                  "Certified delivery personnel with safety training",
                  "Quality-checked cylinders before every delivery",
                  "24/7 customer support via phone and chat",
                  "Cylinder safety inspection and registration",
                  "Transparent pricing with no hidden charges",
                  "Delivery insurance for your peace of mind"
                ].map((benefit, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 opacity-0 animate-fade-in-left"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }} />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative animate-fade-in-right">
              <Card className="shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(34,197,94,0.3)] transition-all duration-500 hover:scale-105 border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Current Pricing
                  </CardTitle>
                  <CardDescription>Updated in real-time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg hover:from-primary/10 transition-colors duration-300">
                    <span className="font-medium">6 KG Cylinder</span>
                    <span className="text-2xl font-bold text-primary">KES 950</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-accent/5 to-transparent rounded-lg hover:from-accent/10 transition-colors duration-300">
                    <span className="font-medium">13 KG Cylinder</span>
                    <span className="text-2xl font-bold text-primary">KES 1,850</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-secondary/5 to-transparent rounded-lg hover:from-secondary/10 transition-colors duration-300">
                    <span className="font-medium">35 KG Cylinder</span>
                    <span className="text-2xl font-bold text-primary">KES 4,200</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    * Delivery fee: FREE for orders within 5km
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted & Certified</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your safety and satisfaction are our top priorities
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Award className="h-16 w-16 text-primary" />,
                title: "ISO Certified",
                description: "International standards for quality and safety management"
              },
              {
                icon: <Shield className="h-16 w-16 text-primary" />,
                title: "Licensed by EPRA",
                description: "Fully licensed and regulated by Energy and Petroleum Authority"
              },
              {
                icon: <Users className="h-16 w-16 text-primary" />,
                title: "Trained Personnel",
                description: "All delivery staff certified in LPG safety and handling"
              }
            ].map((item, index) => (
              <Card 
                key={index}
                className="text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="pt-8">
                  <div className="mb-4 flex justify-center animate-bounce-soft" style={{ animationDelay: `${index * 0.5}s` }}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Youth Energy Hub Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-full text-white text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 animate-pulse" />
              NEW: Youth Energy Hub
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Join the Green Energy Revolution
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gamified learning, social challenges, and community engagement for the next generation of energy leaders
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: <TrendingUp className="h-12 w-12 text-primary" />,
                title: "Earn Points & Level Up",
                description: "Complete challenges, learn about energy efficiency, and climb the leaderboard",
                color: "from-blue-500 to-purple-500"
              },
              {
                icon: <Users className="h-12 w-12 text-accent" />,
                title: "Compete with Peers",
                description: "Join a community of young energy innovators and share your achievements",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <Award className="h-12 w-12 text-secondary" />,
                title: "Unlock Achievements",
                description: "Earn badges, share on social media, and become an energy ambassador",
                color: "from-pink-500 to-orange-500"
              }
            ].map((item, index) => (
              <Card 
                key={index}
                className="text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up border-2 hover:border-primary"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardContent className="pt-8">
                  <div className={`mb-4 flex justify-center w-20 h-20 rounded-full bg-gradient-to-br ${item.color} items-center mx-auto`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/youth-hub">
              <Button size="lg" className="bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 text-lg px-8 py-6 animate-pulse-glow">
                <Sparkles className="mr-2 h-5 w-5" />
                Explore Youth Hub
                <ChevronDown className="ml-2 h-5 w-5 rotate-[-90deg]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Support Hub Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Headphones className="h-4 w-4" />
              24/7 Customer Support
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Always Here to Help
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get instant assistance with AI-powered chat, multilingual support, and comprehensive help resources
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="h-12 w-12 text-primary" />,
                title: "AI-Powered Chat",
                description: "Instant 24/7 support in English and Swahili with intelligent responses to your questions",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Award className="h-12 w-12 text-accent" />,
                title: "Ticket System",
                description: "Track your support requests with auto-generated ticket numbers and real-time status updates",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <Package className="h-12 w-12 text-secondary" />,
                title: "Knowledge Base",
                description: "Searchable FAQ database with 20+ articles covering orders, payments, delivery, and safety",
                color: "from-green-500 to-emerald-500"
              }
            ].map((item, index) => (
              <Card 
                key={index}
                className="text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up border-2 hover:border-primary/30"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardContent className="pt-8">
                  <div className={`mb-4 flex justify-center w-20 h-20 rounded-full bg-gradient-to-br ${item.color} items-center mx-auto`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/support">
              <Button size="lg" className="bg-primary hover:opacity-90 text-lg px-8 py-6">
                <Headphones className="mr-2 h-5 w-5" />
                Get Support Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feedback & Reviews Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white text-sm font-medium mb-4">
              <Star className="h-4 w-4 fill-white" />
              Customer Feedback
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Your Voice Matters
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share your experience and help us improve with our comprehensive feedback system
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Star className="h-6 w-6 text-white fill-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">5-Star Rating System</h3>
                      <p className="text-muted-foreground">Rate service quality, delivery speed, product condition, and overall experience</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Sentiment Analysis</h3>
                      <p className="text-muted-foreground">Automatic categorization of feedback to identify trends and improve services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Real-Time Analytics</h3>
                      <p className="text-muted-foreground">Track customer satisfaction trends and make data-driven improvements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <Card className="shadow-2xl border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Customer Satisfaction
                  </CardTitle>
                  <CardDescription>Real-time feedback metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Service Quality</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Delivery Speed</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Product Quality</span>
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">4.8/5.0</div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/feedback">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-primary/5">
                <Star className="mr-2 h-5 w-5" />
                Share Your Feedback
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rewards Marketplace Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white text-sm font-medium mb-4">
              <Gift className="h-4 w-4" />
              Rewards Marketplace
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Redeem Your Points
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Turn your loyalty points into real rewards - discounts, free deliveries, and exclusive perks
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <CreditCard className="h-8 w-8 text-white" />,
                title: "Delivery Discounts",
                points: "500 points",
                description: "Get 20% off your next delivery",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <Zap className="h-8 w-8 text-white" />,
                title: "Free Delivery",
                points: "1,000 points",
                description: "One free delivery of any size",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: <Star className="h-8 w-8 text-white fill-white" />,
                title: "Premium Month",
                points: "2,500 points",
                description: "30 days of premium benefits",
                color: "from-amber-500 to-amber-600"
              }
            ].map((item, index) => (
              <Card 
                key={index}
                className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up border-2 hover:border-primary"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                <CardContent className="pt-6">
                  <div className={`mb-4 flex justify-center w-16 h-16 rounded-full bg-gradient-to-br ${item.color} items-center mx-auto`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">{item.title}</h3>
                  <p className="text-center text-sm font-medium text-primary mb-2">{item.points}</p>
                  <p className="text-muted-foreground text-center text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/rewards">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-lg px-8 py-6 text-white">
                <Gift className="mr-2 h-5 w-5" />
                Explore Rewards
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Team Challenges Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-sm font-medium mb-4">
              <Trophy className="h-4 w-4" />
              Team Challenges
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Compete Together, Win Together
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join or create teams, compete in collaborative challenges, and climb the leaderboard together
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Team Leaderboard
                  </CardTitle>
                  <CardDescription>Top performing teams this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Energy Warriors", points: "15,750", rank: 1, color: "text-yellow-500" },
                      { name: "Green Champions", points: "14,200", rank: 2, color: "text-gray-400" },
                      { name: "Eco Defenders", points: "12,800", rank: 3, color: "text-amber-600" }
                    ].map((team, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-muted to-transparent rounded-lg hover:from-primary/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl font-bold ${team.color}`}>#{team.rank}</div>
                          <div>
                            <div className="font-semibold">{team.name}</div>
                            <div className="text-sm text-muted-foreground">{team.points} points</div>
                          </div>
                        </div>
                        <Trophy className={`h-5 w-5 ${team.color}`} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Create or Join Teams</h3>
                      <p className="text-muted-foreground">Form teams with friends, family, or make new connections in the community</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Collaborative Challenges</h3>
                      <p className="text-muted-foreground">Work together to complete team challenges and earn bonus points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Exclusive Team Rewards</h3>
                      <p className="text-muted-foreground">Unlock special rewards available only to top-performing teams</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/team-challenges">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-lg px-8 py-6 text-white">
                <Trophy className="mr-2 h-5 w-5" />
                Join Team Challenges
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Got questions? We've got answers
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 animate-shimmer" style={{ 
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            backgroundSize: "200% 100%"
          }} />
        </div>
        <div className="container mx-auto max-w-4xl text-center space-y-8 relative z-10">
          <div className="animate-scale-in">
            <Zap className="h-16 w-16 text-white mx-auto mb-4 animate-bounce-soft" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white animate-fade-in-up">
            Ready to Experience Smart LPG Delivery?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Join thousands of satisfied customers across Kenya
          </p>
          <Link to="/login">
            <Button 
              size="lg" 
              className="text-lg px-12 bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.5)] hover:scale-110 transition-all duration-300 animate-fade-in-up animate-pulse-glow"
              style={{ animationDelay: "0.4s" }}
            >
              Get Started Now →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4 animate-fade-in-left">
              <div className="flex items-center gap-2">
                <Package className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl gradient-text">Green Wells</span>
              </div>
              <p className="text-muted-foreground">
                Reimagining the LPG consumer experience in Kenya
              </p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Order Now</Link></li>
                <li><Link to="/tracking" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Track Order</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Dashboard</Link></li>
                <li><Link to="/safety" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Safety Hub</Link></li>
              </ul>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/support" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Support Hub</Link></li>
                <li><Link to="/feedback" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Give Feedback</Link></li>
                <li><Link to="/support" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Help Center</Link></li>
                <li><Link to="/support" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Live Chat</Link></li>
              </ul>
            </div>
            <div className="animate-fade-in-right" style={{ animationDelay: "0.3s" }}>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Phone: 0700 000 000</li>
                <li>Email: info@greenwells.co.ke</li>
                <li>Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2025 Green Wells SmartConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
