/**
 * Jeesi.ai Agent Widget
 * Embed AI agents on any website
 */

(function() {
  'use strict';

  const JeesiWidget = {
    config: {},
    
    init: function(options) {
      this.config = {
        agentId: options.agentId,
        apiKey: options.apiKey,
        containerId: options.containerId || 'jeesi-agent',
        theme: options.theme || 'light',
        position: options.position || 'bottom-right',
        apiUrl: options.apiUrl || 'https://kyysnciirgauhzzqobly.supabase.co/functions/v1/agent-runtime'
      };

      if (!this.config.agentId || !this.config.apiKey) {
        console.error('Jeesi Widget: agentId and apiKey are required');
        return;
      }

      this.render();
      this.attachEventListeners();
    },

    render: function() {
      const container = document.getElementById(this.config.containerId);
      if (!container) {
        console.error(`Jeesi Widget: Container #${this.config.containerId} not found`);
        return;
      }

      const isDark = this.config.theme === 'dark';
      const isInline = this.config.position === 'inline';

      const styles = `
        .jeesi-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ${isInline ? '' : `
            position: fixed;
            ${this.config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'bottom: 20px; left: 20px;'}
            z-index: 9999;
          `}
          width: ${isInline ? '100%' : '400px'};
          max-width: ${isInline ? '100%' : '400px'};
          height: ${isInline ? '600px' : '600px'};
          background: ${isDark ? '#1f2937' : '#ffffff'};
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .jeesi-header {
          padding: 16px;
          background: ${isDark ? '#111827' : '#f9fafb'};
          border-bottom: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .jeesi-title {
          font-weight: 600;
          font-size: 16px;
          color: ${isDark ? '#f9fafb' : '#111827'};
        }
        .jeesi-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .jeesi-message {
          padding: 12px;
          border-radius: 8px;
          max-width: 80%;
          word-wrap: break-word;
        }
        .jeesi-message.user {
          background: ${isDark ? '#3b82f6' : '#3b82f6'};
          color: white;
          align-self: flex-end;
          margin-left: auto;
        }
        .jeesi-message.assistant {
          background: ${isDark ? '#374151' : '#f3f4f6'};
          color: ${isDark ? '#f9fafb' : '#111827'};
          align-self: flex-start;
        }
        .jeesi-input-container {
          padding: 16px;
          border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
          display: flex;
          gap: 8px;
        }
        .jeesi-input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
          border-radius: 8px;
          background: ${isDark ? '#111827' : '#ffffff'};
          color: ${isDark ? '#f9fafb' : '#111827'};
          font-size: 14px;
        }
        .jeesi-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .jeesi-send-btn {
          padding: 10px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
        }
        .jeesi-send-btn:hover {
          background: #2563eb;
        }
        .jeesi-send-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `;

      const styleTag = document.createElement('style');
      styleTag.textContent = styles;
      document.head.appendChild(styleTag);

      container.innerHTML = `
        <div class="jeesi-widget">
          <div class="jeesi-header">
            <div class="jeesi-title">AI Assistant</div>
          </div>
          <div class="jeesi-messages" id="jeesi-messages">
            <div class="jeesi-message assistant">
              Hi! I'm your AI assistant. How can I help you today?
            </div>
          </div>
          <div class="jeesi-input-container">
            <input 
              type="text" 
              class="jeesi-input" 
              id="jeesi-input" 
              placeholder="Type your message..."
            />
            <button class="jeesi-send-btn" id="jeesi-send">Send</button>
          </div>
        </div>
      `;
    },

    attachEventListeners: function() {
      const input = document.getElementById('jeesi-input');
      const sendBtn = document.getElementById('jeesi-send');

      const sendMessage = () => {
        const message = input.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        input.value = '';
        sendBtn.disabled = true;

        this.callAgent(message).finally(() => {
          sendBtn.disabled = false;
        });
      };

      sendBtn.addEventListener('click', sendMessage);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });
    },

    addMessage: function(role, content, isStreaming = false) {
      const messagesContainer = document.getElementById('jeesi-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `jeesi-message ${role}`;
      messageDiv.textContent = content;
      if (isStreaming) {
        messageDiv.id = 'jeesi-streaming-message';
      }
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return messageDiv;
    },

    updateStreamingMessage: function(content) {
      const streamingMsg = document.getElementById('jeesi-streaming-message');
      if (streamingMsg) {
        streamingMsg.textContent = content;
        const messagesContainer = document.getElementById('jeesi-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    },

    finalizeStreamingMessage: function() {
      const streamingMsg = document.getElementById('jeesi-streaming-message');
      if (streamingMsg) {
        streamingMsg.removeAttribute('id');
      }
    },

    callAgent: async function(userMessage) {
      try {
        const response = await fetch(this.config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey
          },
          body: JSON.stringify({
            agentId: this.config.agentId,
            messages: [
              { role: 'user', content: userMessage }
            ],
            stream: true
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        // Check if response is SSE stream
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('text/event-stream')) {
          // Handle SSE streaming response
          await this.handleSSEStream(response);
        } else {
          // Handle non-streaming JSON response
          const data = await response.json();
          const assistantMessage = data.response || 'I apologize, but I encountered an error.';
          this.addMessage('assistant', assistantMessage);
        }

      } catch (error) {
        console.error('Jeesi Widget Error:', error);
        this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      }
    },

    handleSSEStream: async function(response) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';
      let messageStarted = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line || line.startsWith(':')) continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.type === 'chunk' && data.content) {
                if (!messageStarted) {
                  this.addMessage('assistant', '', true);
                  messageStarted = true;
                }
                fullResponse += data.content;
                this.updateStreamingMessage(fullResponse);
              } else if (data.type === 'done') {
                this.finalizeStreamingMessage();
              } else if (data.type === 'error') {
                if (!messageStarted) {
                  this.addMessage('assistant', data.error || 'An error occurred.');
                } else {
                  this.updateStreamingMessage(data.error || 'An error occurred.');
                  this.finalizeStreamingMessage();
                }
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete data
            }
          }
        }

        // Finalize if not already done
        if (messageStarted) {
          this.finalizeStreamingMessage();
        }
      } catch (error) {
        console.error('SSE Stream Error:', error);
        this.finalizeStreamingMessage();
      }
    }
  };

  // Expose to global scope
  window.JeesiWidget = JeesiWidget;
})();
