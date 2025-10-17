import { useState, useCallback } from 'react'

export function useGeminiChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(
    async (userMessage) => {
      if (!userMessage.trim()) return null

      try {
        setLoading(true)
        setError(null)

        // Add user message to history
        const newUserMessage = {
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, newUserMessage])

        // Prepare conversation history for API
        const conversationHistory = [
          ...messages,
          newUserMessage,
        ].map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))

        // Call Gemini API
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY
        if (!apiKey) {
          throw new Error('Gemini API key not found')
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: conversationHistory,
            }),
          }
        )

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }

        const data = await response.json()

        // Extract assistant response
        const assistantContent = data.candidates[0].content.parts[0].text

        const assistantMessage = {
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setLoading(false)

        return assistantContent
      } catch (err) {
        console.error('Error in sendMessage:', err)
        setError(err.message)
        setLoading(false)
        return null
      }
    },
    [messages]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
  }
}
