<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="chat-main">
      <div class="chat-container">
        <header class="chat-intro">
          <div class="bot-avatar">🤖</div>
          <h1>AI Support</h1>
          <p class="disclaimer">
            I'm here to listen and provide wellness resources. 
            <strong>If you are in a crisis, please contact emergency services.</strong>
          </p>
        </header>

        <div class="chat-controls">
          <button @click="resetChat" class="reset-btn" title="Clear conversation">
            Reset Chat
          </button>
        </div>

        <div class="chat-window-wrapper">
          <div class="message-list" ref="chatWindow">
            <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
              <div class="bubble">
                <span v-if="msg.isLoading">AI is thinking...</span>
                <span v-else>{{ msg.text }}</span>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleSend" class="input-area">
            <input 
              v-model="userInput" 
              type="text" 
              :disabled="loading"
              placeholder="Tell me how you're feeling..." 
              aria-label="Chat input"
            />
            <button type="submit" :disabled="!userInput.trim() || loading">
              {{ loading ? '...' : 'Send' }}
            </button>
          </form>
        </div>
        
        <div class="chat-suggestions">
          <span>Try asking:</span>
          <button @click="suggest('I feel anxious')" :disabled="loading">"I feel anxious"</button>
          <button @click="suggest('Tips for better sleep')" :disabled="loading">"Sleep tips"</button>
          <button @click="suggest('How to meditate')" :disabled="loading">"How to meditate"</button>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { getAiMessage } from '../service/aiServices'

const userInput = ref('')
const chatWindow = ref(null)
const loading = ref(false)

// Initial message state
const initialGreeting = { 
  role: 'bot', 
  text: 'Hello! How can I support your wellness journey today?', 
  isLoading: false 
}

const messages = ref([initialGreeting])

// Reset function
const resetChat = () => {
  if (confirm("Are you sure you want to clear this conversation?")) {
    messages.value = [initialGreeting]
    userInput.value = ''
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatWindow.value) {
    chatWindow.value.scrollTop = chatWindow.value.scrollHeight
  }
}

const handleSend = async () => {
  if (!userInput.value.trim() || loading.value) return

  const userText = userInput.value
  messages.value.push({ role: 'user', text: userText, isLoading: false })
  userInput.value = ''
  await scrollToBottom()

  loading.value = true
  messages.value.push({ role: 'bot', text: '', isLoading: true })
  await scrollToBottom()

  try {
    const response = await getAiMessage(
      "Give a supportive message for someone who feels: " + userText
    )

    const lastMsg = messages.value[messages.value.length - 1]
    lastMsg.text = response
    lastMsg.isLoading = false
  } catch (error) {
    const lastMsg = messages.value[messages.value.length - 1]
    lastMsg.text = "I'm having trouble connecting right now. Please try again."
    lastMsg.isLoading = false
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

const suggest = (text) => {
  userInput.value = text
  handleSend()
}
</script>

<style scoped>
.page-wrapper { display: flex; flex-direction: column; min-height: 100vh; background-color: #f8fafc; }
.chat-main { flex: 1; display: flex; justify-content: center; padding: 20px; }
.chat-container { width: 100%; max-width: 700px; display: flex; flex-direction: column; }
.chat-intro { text-align: center; margin-bottom: 20px; }
.bot-avatar { font-size: 3rem; }
.disclaimer { font-size: 0.8rem; color: #64748b; margin-top: 10px; }

/* Reset Button Styles */
.chat-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.reset-btn {
  background: none;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.reset-btn:hover {
  background-color: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}

.chat-window-wrapper { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; height: 500px; overflow: hidden; border: 1px solid #e2e8f0; }
.message-list { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
.message { display: flex; width: 100%; }
.message.user { justify-content: flex-end; }
.message.bot { justify-content: flex-start; }
.bubble { max-width: 80%; padding: 12px 16px; border-radius: 18px; font-size: 0.95rem; line-height: 1.4; }
.user .bubble { background-color: #42b883; color: white; border-bottom-right-radius: 4px; }
.bot .bubble { background-color: #f1f5f9; color: #1e293b; border-bottom-left-radius: 4px; }
.input-area { display: flex; padding: 15px; background: #ffffff; border-top: 1px solid #e2e8f0; gap: 10px; }
input { flex: 1; padding: 12px 15px; border-radius: 25px; border: 1px solid #cbd5e1; outline: none; transition: border-color 0.2s; }
input:focus { border-color: #42b883; }
button[type="submit"] { background-color: #42b883; color: white; border: none; padding: 0 20px; border-radius: 25px; font-weight: 600; cursor: pointer; }
button[type="submit"]:disabled { background-color: #cbd5e1; cursor: not-allowed; }
.chat-suggestions { margin-top: 20px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.chat-suggestions button { background: white; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 0.8rem; }
</style>