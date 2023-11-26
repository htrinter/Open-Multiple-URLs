<template>
  <section id="url-list-input">
    <label for="urls">List of URLs / Text to extract URLs from:</label>
    <textarea
      ref="urlTextArea"
      id="urls"
      wrap="soft"
      tabindex="1"
      :value="store.urlList"
      @input="handleUrlListInput"
    ></textarea>
  </section>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import { store } from '@/browseraction/components/store/store'

export default {
  computed: {
    store() {
      return store
    }
  },
  setup() {
    const urlTextArea = ref(null)

    onMounted(() => {
      if (urlTextArea.value) {
        ;(urlTextArea.value as unknown as HTMLInputElement).select()
      }
    })

    return {
      urlTextArea
    }
  },
  methods: {
    handleUrlListInput(event: Event) {
      store.setUrlList((event?.target as HTMLInputElement).value)
    }
  }
}
</script>

<style scoped></style>
