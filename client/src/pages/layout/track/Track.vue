<template>
  <div>{{ userStore.userProfile?.username }}</div>
</template>

<script setup lang="ts" name='Track'>
import { useUserRedux } from "@/hooks/useRedux.ts";

const [userStore, dispatch] = useUserRedux();
console.log(userStore);
</script>

<style scoped lang="scss">

</style>
