import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, Bot, User, Trash2, Download, Loader2 } from 'lucide-react';
import { agentsApi, conversationsApi } from '../services/api';
import { Message } from '@local-code-agent/shared';
import { useToast } from '../providers/ToastProvider';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const AgentChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { success, error: showError } = useToast();

  const { data: agent } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const response = await agentsApi.getById(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations', id],
    queryFn: async () => {
      const response = await conversationsApi.getAll({ agentId: id });
      return response.data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (conversations && conversations.length > 0 && !conversationId) {
      setConversationId(conversations[0].id);
    }
  }, [conversations, conversationId]);

  const { data: conversation, refetch: refetchConversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const response = await conversationsApi.getById(conversationId!);
      return response.data.data;
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createConversationMutation = useMutation({
    mutationFn: () => conversationsApi.create({
      agentId: id!,
      title: `Chat - ${new Date().toLocaleString()}`,
    }),
    onSuccess: (response) => {
      setConversationId(response.data.data.id);
      success('New conversation started');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) {
        const newConv = await createConversationMutation.mutateAsync();
        const newConvId = newConv.data.data.id;
        return conversationsApi.addMessage(newConvId, {
          role: 'user',
          content,
          timestamp: new Date(),
        });
      }
      return conversationsApi.addMessage(conversationId, {
        role: 'user',
        content,
        timestamp: new Date(),
      });
    },
    onSuccess: () => {
      setInput('');
      refetchConversation();
      // TODO: Trigger agent execution
    },
    onError: (err: any) => {
      showError(err.message || 'Failed to send message');
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessageMutation.mutate(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear this conversation?')) {
      createConversationMutation.mutate();
    }
  };

  const handleExportChat = () => {
    const chatText = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${conversationId}-${Date.now()}.txt`;
    a.click();
    success('Chat exported');
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const isBot = message.role === 'assistant';

    return (
      <div
        key={index}
        className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {isBot && (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
        )}

        <div
          className={`max-w-3xl rounded-lg p-4 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200'
          }`}
        >
          <MessageContent content={message.content} isUser={isUser} />
          <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {isUser && (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {agent?.name || 'Agent Chat'}
              </h1>
              <p className="text-sm text-gray-600">
                {agent?.description || 'Interactive conversation'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportChat}
              disabled={messages.length === 0}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Export Chat"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleClearChat}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Start a conversation
            </h2>
            <p className="text-gray-500">
              Send a message to begin chatting with {agent?.name}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

const MessageContent = ({ content, isUser }: MessageContentProps) => {
  // Simple code block detection
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index),
      });
    }

    // Add code block
    parts.push({
      type: 'code',
      content: match[2],
      language: match[1] || 'text',
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex),
    });
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <div key={index} className="rounded overflow-hidden">
              <SyntaxHighlighter
                language={part.language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  fontSize: '0.875rem',
                }}
              >
                {part.content}
              </SyntaxHighlighter>
            </div>
          );
        }
        return (
          <div key={index} className="whitespace-pre-wrap">
            {part.content}
          </div>
        );
      })}
    </div>
  );
};
