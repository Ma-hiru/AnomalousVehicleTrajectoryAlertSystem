/** 基本URL */
export const baseUrl = import.meta.env.VITE_URL;

/** token prefix type */
export enum tokenTypePrefix {
  /** BearerToken */
  Bearer = "Bearer ",
  /** NonePrefix */
  None = ""
}

/** The prefix of token in this project. */
export const tokenPrefix = tokenTypePrefix.Bearer;
export const screensConfig = {
  "xs": 480,
  "sm": 640,
  "md": 768,
  "lg": 1024,
  "xl": 1280,
  "2xl": 1536
};

export enum API {
  LoginUrl = "/api/user/login"
}

export const BUFFER_MAX_DURATION = 30;
export const MAX_QUEUE_LENGTH = 100;
