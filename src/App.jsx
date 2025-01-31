import ChatBot from 'react-simple-chatbot';
import './App.css';
import { Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

function App() {
  return (
    <>
      <div>
        <Segment floated="left" style={{ width: '50%', height: '100vh' }}>
          <ChatBot
            steps={[
              {
                id: '1',
                message: 'Hello! Please enter your name.',
                trigger: '2',
              },
              {
                id: '2',
                user: true,
                trigger: '3',
              },
              {
                id: '3',
                message: 'Hi {previousValue}! Do you want to summarize (press 1) or navigate (press 2)?',
                trigger: '4',
              },
              {
                id: '4',
                user: true,
                validator: (value) => {
                  if (value !== '1' && value !== '2') {
                    return 'Please enter 1 or 2';
                  }
                  return true;
                },
                trigger: ({ value }) => (value === '1' ? '5' : '6'),
              },
              {
                id: '5',
                message: 'You chose to summarize. [Insert summary logic here]. Type "goodbye" to exit.',
                trigger: '7',
              },
              {
                id: '6',
                message: 'You chose to navigate. [Insert navigation logic here]. Type "goodbye" to exit.',
                trigger: '7',
              },
              {
                id: '7',
                user: true,
                validator: (value) => {
                  if (value.toLowerCase() !== 'goodbye') {
                    return 'Type "goodbye" to exit.';
                  }
                  return true;
                },
                trigger: '8',
              },
              {
                id: '8',
                message: 'Goodbye! Have a great day!',
                end: true,
              },
            ]}
          />
        </Segment>
      </div>
    </>
  );
}

export default App;