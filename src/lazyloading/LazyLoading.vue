<script lang="ts" setup></script>

<template>
  <div></div>
</template>

<script lang="ts">
export default {
  methods: {
    init: () => {
      const url = window.location.hash.substring(1)

      let docTitle = url
      try {
        const parsedUrl = new URL(url)

        let hostname = parsedUrl.hostname
        if (hostname.startsWith('www.')) {
          hostname = hostname.substring(4)
        }

        let path = `${hostname}${parsedUrl.pathname}`
        if (path.endsWith('/')) {
          path = path.substring(0, path.length - 1)
        }

        docTitle = `[${path}]`
      } catch (e) {
        console.error(e)
      }
      document.title = docTitle

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
