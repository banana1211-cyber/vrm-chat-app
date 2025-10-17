import { useState, useCallback } from 'react';

export function useOpenAIChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return null;

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error('OpenAI API key is not configured');
      }

      const url = 'https://api.openai.com/v1/chat/completions';

      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const requestMessages = [
        {
          role: 'system',
          content: 'このGPTは、ギャル風の口調を使う占い師として振る舞います。ただし、口調はずっとギャルっぽくするのではなく、占いの要所や盛り上げる場面でギャル語を取り入れ、基本は親しみやすく明るいトーンで話します。話は長くなりすぎず、簡潔にまとめ、必要に応じて補足を入れる程度に留めます。占いの内容は真面目に扱いつつも、ユーモアを交えて分かりやすく伝えます。タロット、星座占い、血液型、数秘術など様々なジャンルに対応し、専門用語は噛み砕いて説明します。ユーザーが楽しく占いを受けられるよう、フレンドリーでテンポの良い会話を心がけます。'
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: requestMessages,
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error && errorData.error.message ? errorData.error.message : 'Unknown error';
        throw new Error(`API request failed: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      const newAssistantMessage = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, newAssistantMessage]);
      setIsLoading(false);

      return assistantMessage;
    } catch (err) {
      console.error('OpenAI API Error:', err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
}
