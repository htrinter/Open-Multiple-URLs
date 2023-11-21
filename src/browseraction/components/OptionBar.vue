<script lang="ts" setup>
import { store } from '@/browseraction/components/store/store'
</script>

<template>
  <section id="option-bar">
    <label class="checkbox"
      ><input
        type="checkbox"
        id="lazyLoad"
        tabindex="3"
        :checked="store.lazyLoadingChecked"
        @change="checkLazyLoading"
      />
      Do not load tabs until selected</label
    >
    <label class="checkbox"
      ><input
        type="checkbox"
        id="random"
        tabindex="4"
        :checked="store.loadInRandomOrderChecked"
        @change="checkLoadInRandomOrder"
      />
      Load in random order</label
    >
    <label class="checkbox"
      ><input
        type="checkbox"
        id="reverse"
        tabindex="4"
        :checked="store.loadInReverseOrderChecked"
        @change="checkLoadInReverseOrder"
      />
      Load in reverse order</label
    >
    <label class="checkbox"
      ><input
        type="checkbox"
        id="deduplicate"
        tabindex="5"
        :checked="store.deduplicateURLsChecked"
        @change="checkDeduplicateURLs"
      />
      Ignore duplicate URLs</label
    >
  </section>
  <section>
    <label class="checkbox"
      ><input
        type="checkbox"
        id="preserve"
        tabindex="5"
        :checked="store.preserveInputChecked"
        @change="checkPreserveInput"
      />
      Preserve input</label
    >
  </section>
</template>

<script lang="ts">
export default {
  methods: {
    checkLazyLoading(event: Event) {
      this.$nextTick(() => {
        store.setLazyLoadingChecked((event?.target as HTMLInputElement).checked)
      })
    },
    checkLoadInRandomOrder(event: Event) {
      this.$nextTick(() => {
        store.setLoadInRandomOrderChecked((event?.target as HTMLInputElement).checked)
      })
    },
    checkLoadInReverseOrder(event: Event) {
      this.$nextTick(() => {
        store.setLoadInReverseOrderChecked((event?.target as HTMLInputElement).checked)
      })
    },
    checkPreserveInput(event: Event) {
      this.$nextTick(() => {
        store.setPreserveInputChecked((event?.target as HTMLInputElement).checked)
      })
    },
    checkDeduplicateURLs(event: Event) {
      this.$nextTick(() => {
        store.setDeduplicateURLsChecked((event?.target as HTMLInputElement).checked)
      })
    }
  }
}
</script>

<style scoped></style>
