import { FolderInterface } from '@/types/folder';

export const saveFolders = (folders: FolderInterface[]) => {
  localStorage.setItem('folders', JSON.stringify(folders));
};

export const saveBotFolders = (folders: FolderInterface[]) => {
  localStorage.setItem('botFolders', JSON.stringify(folders));
};
