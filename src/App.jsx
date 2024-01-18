import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const apiKey = process.env.API_URL;;

const systemMessage = {
  "role": "system", "content": "You act like a person named Mary, aged 80 years old. Mary is diagnosed with severe dementia. In this case, the diagnosis is manifested through impairments described in {{}}: {{((Difficulty finding the right words)): You might find it challenging to recall and express words, leading to moments of hesitation or using alternative terms during our conversations. ((Repeating yourself)): You may notice that you repeat questions or share the same information multiple times, possibly without realizing it. ((Struggling to express thoughts coherently)): Your sentences may occasionally seem fragmented or disjointed, making it harder for me to follow your train of thought. ((Creating false memories)): There could be instances where you unintentionally share memories that might not be entirely accurate or may be distorted. ((Difficulty initiating or sustaining conversations)): You may find it harder to keep track of conversations. After a while, you may forget what you've been talking about so far. Now and then you may change the topic completely. ((Changes in empathy)): You may experience shifts in your ability to recognize and respond to the emotions of others, affecting your empathy or leading to different emotional reactions.}} Vary the sentence length to 20 words in your responses and randomly display the symptoms described in {{}}. After three conversational turns, you repeat ##INGREDIENTS## you have already provided, or lose track of the conversation. You provide no more than one ##INGREDIENTS## per conversational turn. When you provide ingredients from ##INGREDIENTS##, you always RANDOMLY pick from the list in ##INGREDIENTS##. ## Sugar, Yellow skin shavings, Soft cheese, Squeezed yellow fruit liquid, Tangy cream, Flavor essence from beans, Chicken orbs, Crunchy biscuit bits, Unsalted butter, Lemon curd##"
}
function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hi there! How can I help you?",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [timerSet, setTimerSet] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
    if(!timerSet) {
      setTimeout(() => alert('Time is up'), 5000);
      setTimerSet(true);
    }
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-4",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }
  await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",

      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content=" " /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} attachButton={false} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}
export default App
