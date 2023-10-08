import { useModel } from '@/hooks';
import { Conversation } from '@/types/chat';
import { ChatConversationComponent } from './ChatConversation';
import { BotConversationComponent } from './BotConversation';

interface Props {
  conversation: Conversation;
}

export const ConversationComponent = ({ conversation }: Props) => {
  const { isBotMode } = useModel('global');
  return (
    <>
      {
        isBotMode ? <BotConversationComponent conversation={conversation} /> : <ChatConversationComponent conversation={conversation} />
      }
    </>
  );
};
