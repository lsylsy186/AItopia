import { useContext } from 'react';

import { FolderInterface } from '@/types/folder';

import HomeContext from '@/pages/api/home/home.context';

import Folder from '@/components/Folder';

import { ConversationComponent } from './Conversation/index';
import { useModel } from '@/hooks';

interface Props {
  searchTerm: string;
}

export const ChatFolders = ({ searchTerm }: Props) => {
  const {
    handleUpdateConversation,
  } = useContext(HomeContext);
  const { conversations: chatConversations } = useModel('chat');
  const { botConversations } = useModel('bot');
  const { folders, isBotMode } = useModel('global');

  const conversations = isBotMode ? botConversations : chatConversations;
  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, {
        key: 'folderId',
        value: folder.id,
      });
    }
  };

  const ChatFolders = (currentFolder: FolderInterface) => {
    return (
      conversations &&
      conversations
        .filter((conversation: any) => conversation.folderId)
        .map((conversation: any, index: any) => {
          if (conversation.folderId === currentFolder.id) {
            return (
              <div key={index} className="ml-5 gap-2 border-l pl-2">
                <ConversationComponent conversation={conversation} />
              </div>
            );
          }
        })
    );
  };

  return (
    <div className="flex w-full flex-col pt-2">
      {folders
        .filter((folder: any) => folder.type === 'chat')
        .sort((a: any, b: any) => a.name.localeCompare(b.name))
        .map((folder: any, index: any) => (
          <Folder
            key={index}
            searchTerm={searchTerm}
            currentFolder={folder}
            handleDrop={handleDrop}
            folderComponent={ChatFolders(folder)}
          />
        ))}
    </div>
  );
};
