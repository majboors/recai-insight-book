import { useEffect, useState, useRef } from "react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

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
  const [chatDataStatus, setChatDataStatus] = useState<{ usingLiveData: boolean; totalTransactions?: number; message?: string } | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "AI Chat | AI Receipt Analyzer";
    loadBooks();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      setChatDataStatus(null);
      loadInsights();
    }
  }, [selectedBook]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

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

      // Update status indicator based on API response
      const usingLive = Boolean((response as any)?.context_info?.using_live_data);
      const totalTx = (response as any)?.data_status?.total_transactions;
      const infoMsg = (response as any)?.context_info?.message as string | undefined;
      setChatDataStatus({ usingLiveData: usingLive, totalTransactions: totalTx, message: infoMsg });

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
    <div className="container-zen py-6 space-zen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-zen text-2xl sm:text-3xl">AI Assistant</h1>
          <p className="text-zen text-sm">Get personalized financial advice and insights</p>
        </div>
        <Select value={selectedBook} onValueChange={setSelectedBook}>
          <SelectTrigger className="w-full sm:w-48 btn-minimal">
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
        <Card className="card-zen text-center py-12">
          <CardContent>
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="heading-zen text-lg mb-2">No book selected</h3>
            <p className="text-zen">Select a book to start chatting with AI</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid-zen grid-cols-1 lg:grid-cols-3">
          {/* Chat Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chat Window */}
            <Card className="card-minimal h-[500px] flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="heading-zen flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Chat with AI
                    </CardTitle>
                    <CardDescription className="text-zen">Ask questions about your spending patterns</CardDescription>
                  </div>
                  {chatDataStatus && (
                    <div className="min-w-[220px] flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`${chatDataStatus.usingLiveData ? "bg-success" : "bg-destructive"} h-2.5 w-2.5 rounded-full`}
                          aria-hidden="true"
                        />
                        <span className="text-xs">
                          {chatDataStatus.usingLiveData ? "AI has access to your spending data" : "AI in general advice mode"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant={chatDataStatus.usingLiveData ? "secondary" : "destructive"}
                              className="text-[10px]"
                            >
                              {chatDataStatus.usingLiveData
                                ? `Based on ${chatDataStatus.totalTransactions ?? 0} transactions`
                                : "Add transactions for personalized insights"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-xs">
                              {chatDataStatus.message || (chatDataStatus.usingLiveData
                                ? "Chatbot has access to your transaction data"
                                : "Chatbot is in general advice mode (no transaction data available)")}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        {!chatDataStatus.usingLiveData && (
                          <Link to="/scanner">
                            <Button variant="secondary" size="sm">Scan receipts</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-zen">
                        Start a conversation! Ask me about your spending, budgets, or financial goals.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} w-full`}
                        >
                          <div className={`flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-[85%] lg:max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.role === "user" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-accent"
                            }`}>
                              {message.role === "user" ? <User className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
                            </div>
                            <div className={`rounded-lg p-2 sm:p-3 min-w-0 max-w-full ${
                              message.role === "user" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-accent/50"
                            }`}>
                              <div className="text-xs sm:text-sm whitespace-pre-wrap break-all hyphens-auto" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{message.content}</div>
                              <div className="text-[10px] sm:text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="bg-accent/50 rounded-lg p-3">
                            <div className="text-sm">Thinking...</div>
                          </div>
                        </div>
                       )}
                       <div ref={messagesEndRef} />
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
                    className="focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={handleSendMessage} disabled={loading || !messageInput.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Advice */}
            <Card className="card-minimal">
              <CardHeader>
                <CardTitle className="heading-zen flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Get Financial Advice
                </CardTitle>
                <CardDescription className="text-zen">Request specific advice about your finances</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={adviceRequest}
                  onChange={(e) => setAdviceRequest(e.target.value)}
                  placeholder="e.g., How can I reduce my food spending? What's my biggest expense category?"
                  className="min-h-[80px] focus:ring-2 focus:ring-primary"
                />
                <Button onClick={handleGetAdvice} disabled={loading || !adviceRequest.trim()} className="w-full sm:w-auto">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Advice
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Insights Sidebar */}
          <div className="space-y-6">
            <Card className="card-minimal">
              <CardHeader>
                <CardTitle className="heading-zen flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Quick Insights
                </CardTitle>
                <CardDescription className="text-zen">AI-generated insights about your spending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm p-2 rounded bg-accent/20">
                      <span className="font-medium">Total Spent:</span>
                      <span className="font-medium">${insights.total_spent?.toFixed(2) || "0.00"}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Top Categories:</span>
                      {insights.top_categories?.slice(0, 3).map((category: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm p-2 rounded bg-accent/10">
                          <span className="truncate">{category.category_name}</span>
                          <Badge variant="secondary" className="ml-2">${category.total.toFixed(2)}</Badge>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm p-2 rounded bg-accent/20">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span>Trend: {insights.spending_trend || "Stable"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zen">
                    No insights available yet. Add some expenses to get started!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-minimal">
              <CardHeader>
                <CardTitle className="heading-zen">Suggested Questions</CardTitle>
                <CardDescription className="text-zen">Try asking these questions</CardDescription>
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
                    className="w-full justify-start text-left h-auto p-3 hover:bg-accent/50 text-xs"
                    onClick={() => setMessageInput(question)}
                  >
                    <span>{question}</span>
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