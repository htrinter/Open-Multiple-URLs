<script lang="ts" setup>
import { store } from '@/browseraction/components/store/store'
</script>

<template>
  <section id="url-list-input">
    <label for="urls">List of URLs / Text to extract URLs from:</label>
    <textarea
      id="urls"
      wrap="soft"
      tabindex="1"
      :value="store.urlList"
      @input="handleUrlListInput"
    ></textarea>
  </section>
</template>

<script lang="ts">
export default {
  methods: {
    handleUrlListInput(event: Event) {
      store.setUrlList((event?.target as HTMLInputElement).value)
    }
  }
}
</script>

<style scoped></style>
