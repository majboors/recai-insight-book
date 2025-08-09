import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listInstances, postChat, postAdvice, getInsights } from "@/lib/recai";
import { MessageCircle, Send, Bot, User, Lightbulb, TrendingUp, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [adviceRequest, setAdviceRequest] = useState("");
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "AI Chat | AI Receipt Analyzer";
    loadBooks();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      loadInsights();
    }
  }, [selectedBook]);

  const loadBooks = async () => {
    try {
      const response = await listInstances();
      if (response?.instances) {
        setBooks(response.instances);
        if (response.instances.length > 0) {
          setSelectedBook(response.instances[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load books:", error);
    }
  };

  const loadInsights = async () => {
    if (!selectedBook) return;

    try {
      const insightsData = await getInsights(selectedBook, {
        insight_type: "summary"
      });
      setInsights(insightsData);
    } catch (error) {
      console.error("Failed to load insights:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedBook) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: messageInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setMessageInput("");
    setLoading(true);

    try {
      const response = await postChat(selectedBook, {
        message: messageInput,
        context: "general_inquiry"
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: (response as any)?.response || "I'm here to help with your financial questions!",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetAdvice = async () => {
    if (!adviceRequest.trim() || !selectedBook) return;

    setLoading(true);
    try {
      const response = await postAdvice(selectedBook, {
        focus: adviceRequest
      });

      const adviceMessage: ChatMessage = {
        role: "assistant",
        content: `💡 **Financial Advice**: ${(response as any)?.suggestions || "Here's some advice based on your spending patterns."}`,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, adviceMessage]);
      setAdviceRequest("");

      toast({
        title: "Advice Generated",
        description: "AI has provided personalized financial advice",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate advice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">Get personalized financial advice and insights</p>
        </div>
        <Select value={selectedBook} onValueChange={setSelectedBook}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select book" />
          </SelectTrigger>
          <SelectContent>
            {books.map((book) => (
              <SelectItem key={book.id} value={book.id}>
                {book.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedBook ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No book selected</h3>
            <p className="text-muted-foreground">Select a book to start chatting with AI</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Chat Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chat Window */}
            <Card className="h-[500px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat with AI
                </CardTitle>
                <CardDescription>Ask questions about your spending patterns</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Start a conversation! Ask me about your spending, budgets, or financial goals.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === "user" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            }`}>
                              {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div className={`rounded-lg p-3 ${
                              message.role === "user" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            }`}>
                              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                              <div className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="text-sm">Thinking...</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
                
                {/* Message Input */}
                <div className="flex gap-2 mt-4">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your spending, budgets, or financial goals..."
                    disabled={loading}
                  />
                  <Button onClick={handleSendMessage} disabled={loading || !messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Advice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Get Financial Advice
                </CardTitle>
                <CardDescription>Request specific advice about your finances</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={adviceRequest}
                  onChange={(e) => setAdviceRequest(e.target.value)}
                  placeholder="e.g., How can I reduce my food spending? What's my biggest expense category?"
                  className="min-h-[100px]"
                />
                <Button onClick={handleGetAdvice} disabled={loading || !adviceRequest.trim()}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Advice
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Insights Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Quick Insights
                </CardTitle>
                <CardDescription>AI-generated insights about your spending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights ? (
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Total Spent:</span>
                      <span className="float-right">${insights.total_spent?.toFixed(2) || "0.00"}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Top Categories:</span>
                      {insights.top_categories?.slice(0, 3).map((category: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{category.category_name}</span>
                          <Badge variant="secondary">${category.total.toFixed(2)}</Badge>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Spending Trend: {insights.spending_trend || "Stable"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No insights available yet. Add some expenses to get started!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Suggested Questions</CardTitle>
                <CardDescription>Try asking these questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "What are my top spending categories?",
                  "How much did I spend this month?",
                  "Where can I save money?",
                  "What's my average transaction amount?",
                  "Am I over budget in any category?"
                ].map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => setMessageInput(question)}
                  >
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}