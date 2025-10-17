import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Send, Settings, MessageSquare } from 'lucide-react';
import VRMViewer from './components/VRMViewer';
import { useOpenAIChat } from './hooks/useOpenAIChat';
import { useNijiVoice } from './hooks/useNijiVoice';
import './App.css';

function App() {
  const [inputMessage, setInputMessage] = useState('');
  const [vrm, setVrm] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollRef = useRef(null);

  const { messages, isLoading: isChatLoading, error: chatError, sendMessage, clearMessages } = useOpenAIChat();
  const { speak, stop, isSpeaking, isLoading: isVoiceLoading, error: voiceError } = useNijiVoice();

  // 最新の2件のメッセージのみ表示（質問と回答のペア）
  const displayMessages = messages.slice(-2);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isChatLoading) return;

    const userInput = inputMessage;
    setInputMessage('');

    // OpenAI APIでメッセージを送信
    const response = await sendMessage(userInput);

    // 音声が有効な場合、にじボイスで読み上げ
    if (response && voiceEnabled) {
      await speak(response);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVRMLoaded = (loadedVrm) => {
    setVrm(loadedVrm);
    console.log('VRM loaded in App:', loadedVrm);
  };

  return (
    <div className="app-container">
      {/* トップバー */}
      <div className="top-bar">
        <div className="top-buttons">
          <Button className="top-button">
            <Settings className="button-icon" />
            設定
          </Button>
          <Button className="top-button" onClick={clearMessages}>
            <MessageSquare className="button-icon" />
            会話ログ
          </Button>
        </div>
      </div>

      {/* VRMキャラクターエリア */}
      <div className="vrm-area">
        <VRMViewer
          vrmUrl="/avatar.vrm"
          onVRMLoaded={handleVRMLoaded}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* チャットエリア */}
      <div className="chat-area">
        <div className="character-section">
          <h2 className="character-title">CHARACTER</h2>

          {/* エラー表示 */}
          {(chatError || voiceError) && (
            <div className="error-message">
              {chatError || voiceError}
            </div>
          )}

          {/* メッセージ表示 */}
          <div className="messages-container">
            {displayMessages.length === 0 && !isChatLoading && (
              <div className="empty-message">
                <p>聞きたいことを入力してね</p>
              </div>
            )}

            {displayMessages.map((message, index) => (
              <div key={index} className="message-box">
                <div className="message-label">
                  {message.role === 'user' ? 'YOU' : 'CHARACTER'}
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}

            {(isChatLoading || isVoiceLoading) && (
              <div className="message-box">
                <div className="message-label">CHARACTER</div>
                <div className="message-content loading">
                  {isChatLoading ? '占い中...🔮' : '音声生成中...🎵'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 入力エリア */}
        <div className="input-area">
          <div className="input-container">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="聞きたいことを入力してね"
              disabled={isChatLoading}
              className="message-input"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isChatLoading || !inputMessage.trim()}
              className="send-button"
            >
              <Send className="send-icon" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
