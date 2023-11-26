<script lang="ts" setup></script>

<template>
  <div></div>
</template>

<script lang="ts">
export default {
  methods: {
    init: () => {
      document.title =
        '[' +
        window.location.hash
          .substring(1)
          .replace('http://', '')
          .replace('https://', '')
          .replace(/\/$/, '') +
        ']'

      // load site on focus
      window.addEventListener(
        'focus',
        () => {
          window.location.replace(window.location.hash.substr(1))
        },
        false
      )
    }
  },
  beforeMount() {
    this.init()
  }
}
</script>

<style scoped></style>
