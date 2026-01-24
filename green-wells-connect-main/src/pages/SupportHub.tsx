import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { 
  MessageSquare, 
  Ticket, 
  Search, 
  Send, 
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MessagesSquare,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Star,
  Languages,
  HelpCircle,
  BookOpen,
  Video,
  FileText,
  MessageCircleQuestion
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

interface FAQArticle {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful_count: number;
  not_helpful_count: number;
}

const SupportHub = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatSession, setCurrentChatSession] = useState<string | null>(null);
  const [faqArticles, setFaqArticles] = useState<FAQArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium"
  });

  useEffect(() => {
    fetchTickets();
    fetchFAQs();
  }, [selectedLanguage]);

  const fetchTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from("faq_articles")
        .select("*")
        .eq("language", selectedLanguage)
        .eq("is_published", true)
        .order("view_count", { ascending: false });

      if (error) throw error;
      setFaqArticles(data || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  const createTicket = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create a support ticket",
          variant: "destructive"
        });
        return;
      }

      const { error } = await (supabase
        .from("support_tickets") as any)
        .insert({
          user_id: user.id,
          subject: newTicket.subject,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority,
          language: selectedLanguage
        });

      if (error) throw error;

      toast({
        title: "Ticket Created",
        description: "Your support ticket has been created successfully"
      });

      setNewTicket({ subject: "", description: "", category: "general", priority: "medium" });
      setIsCreatingTicket(false);
      fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create support ticket",
        variant: "destructive"
      });
    }
  };

  const startChatSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          session_type: "ai",
          language: selectedLanguage
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentChatSession(data.id);
      
      // Send welcome message
      const welcomeMsg = selectedLanguage === 'sw' 
        ? "Habari! Ninawezaje kukusaidia leo?"
        : "Hello! How can I help you today?";
      
      await sendChatMessage(data.id, welcomeMsg, "ai");
    } catch (error) {
      console.error("Error starting chat session:", error);
    }
  };

  const sendChatMessage = async (sessionId: string, message: string, senderType: string = "customer") => {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          sender_type: senderType,
          message: message
        });

      if (error) throw error;
      
      if (senderType === "customer") {
        // Simulate AI response
        setTimeout(() => {
          const aiResponse = generateAIResponse(message);
          sendChatMessage(sessionId, aiResponse, "ai");
        }, 1000);
      }
      
      fetchChatMessages(sessionId);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (selectedLanguage === 'sw') {
      if (lowerMessage.includes('oda') || lowerMessage.includes('order')) {
        return "Unaweza kuweka oda kwenye ukurasa wa 'Oda'. Chagua ukubwa wa silinda, ingiza anwani, na lipa kupitia M-Pesa.";
      } else if (lowerMessage.includes('malipo') || lowerMessage.includes('payment')) {
        return "Tunakubali malipo ya M-Pesa. Utapokea ujumbe wa kuthibitisha kwenye simu yako mara tu oda inapothibitishwa.";
      } else if (lowerMessage.includes('utoaji') || lowerMessage.includes('delivery')) {
        return "Utoaji kawaida huchukua dakika 30-60. Unaweza kufuatilia utoaji wako kwenye ukurasa wa 'Ufuatiliaji'.";
      }
      return "Naelewa swali lako. Je, ungependa kuongea na msaidizi wa binadamu? Niulize swali lolote kuhusu huduma zetu!";
    } else {
      if (lowerMessage.includes('order') || lowerMessage.includes('oda')) {
        return "You can place an order on the 'Order' page. Select your cylinder size, enter your address, and pay via M-Pesa.";
      } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
        return "We accept M-Pesa payments. You'll receive a confirmation message on your phone once the order is confirmed.";
      } else if (lowerMessage.includes('delivery') || lowerMessage.includes('track')) {
        return "Deliveries typically take 30-60 minutes. You can track your delivery in real-time on the 'Tracking' page.";
      }
      return "I understand your question. Would you like to speak with a human agent? Feel free to ask me anything about our services!";
    }
  };

  const fetchChatMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    if (!currentChatSession) {
      await startChatSession();
      return;
    }

    await sendChatMessage(currentChatSession, newMessage);
    setNewMessage("");
  };

  const markFAQHelpful = async (articleId: string, isHelpful: boolean) => {
    try {
      const article = faqArticles.find(a => a.id === articleId);
      if (!article) return;

      const { error } = await supabase
        .from("faq_articles")
        .update({
          helpful_count: isHelpful ? article.helpful_count + 1 : article.helpful_count,
          not_helpful_count: !isHelpful ? article.not_helpful_count + 1 : article.not_helpful_count
        })
        .eq("id", articleId);

      if (error) throw error;
      fetchFAQs();
      
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our support"
      });
    } catch (error) {
      console.error("Error updating FAQ feedback:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "resolved": return <CheckCircle2 className="h-4 w-4" />;
      case "closed": return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-500";
      case "in_progress": return "bg-yellow-500";
      case "resolved": return "bg-green-500";
      case "closed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-gray-500";
      case "medium": return "bg-blue-500";
      case "high": return "bg-orange-500";
      case "urgent": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const filteredFAQs = faqArticles.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto p-6 pt-24">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Support Hub
            </h1>
            <p className="text-muted-foreground mt-2">
              Get help whenever you need it - 24/7 support at your fingertips
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[180px]">
                <Languages className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sw">Kiswahili</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <HelpCircle className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <Ticket className="h-4 w-4 mr-2" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Live Chat
            </TabsTrigger>
            <TabsTrigger value="help">
              <BookOpen className="h-4 w-4 mr-2" />
              Help Center
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("tickets")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    Support Tickets
                  </CardTitle>
                  <CardDescription>Create and track support requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{tickets.length}</p>
                  <p className="text-sm text-muted-foreground">Active tickets</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("chat")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    Live Chat
                  </CardTitle>
                  <CardDescription>Chat with AI or human agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    <Bot className="inline h-8 w-8 text-green-500" />
                  </p>
                  <p className="text-sm text-muted-foreground">AI available 24/7</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("help")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Help Center
                  </CardTitle>
                  <CardDescription>Browse FAQs and guides</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{faqArticles.length}</p>
                  <p className="text-sm text-muted-foreground">Articles available</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={isCreatingTicket} onOpenChange={setIsCreatingTicket}>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Support Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Support Ticket</DialogTitle>
                      <DialogDescription>
                        Describe your issue and our team will get back to you soon
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="Brief description of your issue"
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                          <SelectTrigger id="category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="order_issue">Order Issue</SelectItem>
                            <SelectItem value="payment">Payment</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="safety">Safety</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                          <SelectTrigger id="priority">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Provide detailed information about your issue..."
                          rows={6}
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                        />
                      </div>
                      <Button onClick={createTicket} className="w-full">
                        Create Ticket
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("chat")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Live Chat
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("help")}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse Help Articles
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Support Tickets</h2>
              <Dialog open={isCreatingTicket} onOpenChange={setIsCreatingTicket}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                    <DialogDescription>
                      Describe your issue and our team will get back to you soon
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                        <SelectTrigger id="category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order_issue">Order Issue</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide detailed information about your issue..."
                        rows={6}
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      />
                    </div>
                    <Button onClick={createTicket} className="w-full">
                      Create Ticket
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {tickets.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageCircleQuestion className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-xl font-semibold mb-2">No tickets yet</p>
                    <p className="text-muted-foreground mb-4">Create your first support ticket to get help</p>
                    <Button onClick={() => setIsCreatingTicket(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ticket
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket) => (
                  <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {ticket.subject}
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Ticket #{ticket.ticket_number} • {new Date(ticket.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(ticket.status)} variant="outline">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace('_', ' ')}
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">{ticket.category.replace('_', ' ')}</Badge>
                        <span className="text-muted-foreground">
                          Last updated: {new Date(ticket.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-green-500" />
                  AI Support Chat
                  <Badge variant="secondary" className="ml-auto">
                    Available 24/7
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Get instant answers from our AI assistant or escalate to a human agent
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessagesSquare className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-xl font-semibold mb-2">Start a conversation</p>
                      <p className="text-muted-foreground mb-4">
                        Our AI assistant is ready to help you with any questions
                      </p>
                      <Button onClick={startChatSession}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex gap-2 max-w-[80%] ${
                              msg.sender_type === "customer" ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div className={`flex-shrink-0 ${msg.sender_type === "customer" ? "ml-2" : "mr-2"}`}>
                              {msg.sender_type === "customer" ? (
                                <User className="h-8 w-8 p-1.5 rounded-full bg-primary text-primary-foreground" />
                              ) : (
                                <Bot className="h-8 w-8 p-1.5 rounded-full bg-green-500 text-white" />
                              )}
                            </div>
                            <div
                              className={`rounded-lg p-3 ${
                                msg.sender_type === "customer"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <Separator className="my-4" />

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Help Center Tab */}
          <TabsContent value="help" className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find answers to common questions about our services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQs.map((faq, index) => (
                      <AccordionItem key={faq.id} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <p className="text-muted-foreground">{faq.answer}</p>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Was this helpful?</span>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markFAQHelpful(faq.id, true)}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Yes ({faq.helpful_count})
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markFAQHelpful(faq.id, false)}
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  No ({faq.not_helpful_count})
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {filteredFAQs.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No articles found matching your search
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Video Tutorials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Watch step-by-step guides on how to use our platform
                    </p>
                    <Button variant="outline" className="mt-4">
                      Browse Videos
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Detailed guides and technical documentation
                    </p>
                    <Button variant="outline" className="mt-4">
                      View Docs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupportHub;
