<script lang="ts" setup>
import { store } from '@/browseraction/components/store/store'
import { NO_LAZY_LOAD_SCHEMES } from './logic/urlschema'
</script>

<template>
  <section id="option-bar-hwrapper">
    <section>
      <!-- Loading options -->
      <label class="checkbox"
        ><input
          type="checkbox"
          id="lazyLoad"
          tabindex="3"
          :checked="store.lazyLoadingChecked"
          @change="checkLazyLoading"
        />
        Do not load tabs until selected &nbsp;<span
          :aria-label="
            'Search queries and the following URL schemes are not supported: ' +
            NO_LAZY_LOAD_SCHEMES.join(', ')
          "
          data-microtip-position="bottom"
          data-microtip-size="large"
          role="tooltip"
        >
          ⓘ
        </span>
      </label>
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
    </section>
    <!-- URL handling options -->
    <section>
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
      <label class="checkbox"
        ><input
          type="checkbox"
          id="searchquery"
          tabindex="6"
          :checked="store.handleAsSearchQueryChecked"
          @change="checkHandleAsSearchQuery"
        />
        Handle Non-URLs as search queries</label
      >
    </section>
  </section>
  <!-- Input handling options -->
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
    },
    checkHandleAsSearchQuery(event: Event) {
      this.$nextTick(() => {
        store.setHandleAsSearchQueryChecked((event?.target as HTMLInputElement).checked)
      })
    }
  }
}
</script>

<style scoped></style>
