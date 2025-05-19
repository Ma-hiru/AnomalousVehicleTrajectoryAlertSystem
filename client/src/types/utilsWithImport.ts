import { FC } from "react";

export type GetReactProps<T> = T extends FC<infer p> ? p : never;
