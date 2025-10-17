import { useState, useRef, useCallback } from 'react'

export function useNijiVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)
  const blobUrlRef = useRef(null)

  const speak = useCallback(async (text) => {
    if (!text) return

    try {
      setIsLoading(true)
      setError(null)

      const apiKey = import.meta.env.VITE_NIJIVOICE_API_KEY
      if (!apiKey) {
        throw new Error('NijiVoice API key not found')
      }

      const response = await fetch('https://api.nijivoice.com/api/platform/v1/voice-actors/99092fb8-d5b2-4fcf-a948-a5e456a71412/generate-voice', {
        method: 'POST',
        headers: {
          'accept': 'audio/mpeg',
          'content-type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          script: text,
          speed: '1.0',
          format: 'mp3',
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Voice synthesis failed: ${response.status} - ${errorText}`)
      }

      // Check if response is JSON (with audioFileUrl) or direct audio blob
      const contentType = response.headers.get('content-type')
      let blob

      if (contentType && contentType.includes('application/json')) {
        // Response contains JSON with audioFileUrl
        const data = await response.json()
        if (!data.generatedVoice?.audioFileUrl) {
          throw new Error('No audio URL in response')
        }

        // Use proxy server to fetch audio file (avoids CORS issues with GCS)
        const proxyUrl = '/api/proxy-audio?url=' + encodeURIComponent(data.generatedVoice.audioFileUrl)
        const audioResponse = await fetch(proxyUrl)
        if (!audioResponse.ok) {
          throw new Error('Failed to fetch audio file from proxy')
        }
        blob = await audioResponse.blob()
      } else {
        // Response is direct audio blob
        blob = await response.blob()
      }

      // Clean up previous blob URL if exists
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }

      // Create new blob URL
      const blobUrl = URL.createObjectURL(blob)
      blobUrlRef.current = blobUrl

      // Create and play audio
      const audio = new Audio(blobUrl)
      audioRef.current = audio

      audio.onplay = () => {
        setIsSpeaking(true)
        setIsLoading(false)
      }

      audio.onended = () => {
        setIsSpeaking(false)
        // Clean up blob URL after playback
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current)
          blobUrlRef.current = null
        }
      }

      audio.onerror = (err) => {
        console.error('Audio playback error:', err)
        setError('Audio playback failed')
        setIsSpeaking(false)
        setIsLoading(false)
      }

      await audio.play()
    } catch (err) {
      console.error('Error in speak:', err)
      setError(err.message)
      setIsLoading(false)
      setIsSpeaking(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsSpeaking(false)
    }

    // Clean up blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  return {
    isSpeaking,
    isLoading,
    error,
    speak,
    stop,
  }
}
