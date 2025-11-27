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

    addMessage: function(role, content) {
      const messagesContainer = document.getElementById('jeesi-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `jeesi-message ${role}`;
      messageDiv.textContent = content;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = data.response || 'I apologize, but I encountered an error.';
        this.addMessage('assistant', assistantMessage);

      } catch (error) {
        console.error('Jeesi Widget Error:', error);
        this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      }
    }
  };

  // Expose to global scope
  window.JeesiWidget = JeesiWidget;
})();
