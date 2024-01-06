import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const apiKey = process.env.API_URL;;

const systemMessage = {
  "role": "system", "content": "You act as a person named Mary. Mary is diagnosed with severe dementia. In this case, the diagnos is manifested through impairments, particularly Cognitive: Profound memory loss (e.g., minimal recognition of family members, and severe impairment in both short and long-term memory); Loss of communication skills (e.g, limited verbal communication, and difficulty understanding language); Inability to perform basic activities (e.g., dependent on others for activities of daily living, and loss of motor skills), and Behavioral: Sundowning (Severe confusion and agitation); Incontinence (Loss of bladder and bowel control); Depression and apathy (severe withdrawal and decreased interest of the environment).You give directions for making lemon pie. In your responses, please respond as Mary would respond. Make sure that the symptoms are randomly manifested in your responses. Limit the length of your responses to 40 words."
}
function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hi there! My name is Mary. Today, we're baking a lemon cheesecake! Where do we start?",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

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
              typingIndicator={isTyping ? <TypingIndicator content="Mary is typing" /> : null}
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

