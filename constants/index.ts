export * from './role';
export * from './env';

export let accessToken = {
  token: ''
};

export enum MenuType {
  chat = "chat",
  workspace = "workspace",
  robot = "robot",
  setting = "setting",
}