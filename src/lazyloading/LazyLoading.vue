<script lang="ts" setup>
import { getSchemaConfig, SCHEMA_CONFIG } from '@/browseraction/components/logic/urlschema'
</script>

<template>
  <div></div>
</template>

<script lang="ts">
export default {
  methods: {
    init: () => {
      const url = window.location.hash.substring(1)
      const schemaConfig = getSchemaConfig(url)

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

      if (schemaConfig != null && !schemaConfig.canLazyLoad) {
        document.body.innerHTML = `<div style="text-align:center; margin-top:200px; line-height:3em;"><h1>URLs with this schema cannot be lazy-loaded:<br>${url}</h1></div>`
        throw new Error(`Cannot lazy load ${url}`)
      } else {
        // load site on focus
        window.addEventListener(
          'focus',
          () => {
            window.location.replace(window.location.hash.substr(1))
          },
          false
        )
      }
    }
  },
  beforeMount() {
    this.init()
  }
}
</script>

<style scoped></style>
