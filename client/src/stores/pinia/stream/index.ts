import { defineStore } from "pinia";
import { setup } from "@/stores/pinia/stream/setup";

export const useStreamStore = defineStore("streamStore", setup);
