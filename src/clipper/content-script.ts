if (!document.body.hasAttribute('omu-clipper-initialized')) {
  console.log('initialize clipper')
  const collectedUrls: string[] = []
  let selectedElement: HTMLElement | null = null

  const addUrlsToCollection = (element: HTMLElement) => {
    const wrapper = document.createElement('div')
    wrapper.appendChild(element.cloneNode(true))

    Array.from(wrapper.querySelectorAll('a')).forEach((link) => {
      const href = link.getAttribute('href')
      if (href) {
        const prependProtocol = !href.startsWith(window.location.protocol)
        const prependHost = prependProtocol && !href.startsWith(window.location.host)
        const prependPath = prependHost && !href.startsWith('/')

        const url = `${prependProtocol ? `${window.location.protocol}//` : ''}${
          prependHost ? window.location.host : ''
        }${
          prependPath
            ? `${window.location.pathname}${!window.location.pathname.endsWith('/') ? '/' : ''}`
            : ''
        }${href}`

        collectedUrls.push(url)
      }
    })
        const collectedCountEl = document.querySelector('#collected-count')
    if (collectedCountEl) {
      collectedCountEl.innerHTML = String(collectedUrls.length)
    }
  }

  const copyCollectionToClipboard = () => {
    navigator.clipboard.writeText(collectedUrls.join('\n'))
  }

  const handleMouseOver = (event: MouseEvent) => {
    if (
      selectedElement !== event.target &&
      !(event.target as HTMLElement).classList.contains('opmurls')
    ) {
      if (selectedElement) {
        selectedElement.style.outline = ''
      }
      selectedElement = event.target as HTMLElement
      selectedElement.style.outline = '4px solid red'
    }
    event.stopPropagation()
  }

  const handleMouseOut = (event: MouseEvent) => {
    if (
      selectedElement &&
      selectedElement === event.target &&
      !(event.target as HTMLElement).classList.contains('opmurls')
    ) {
      selectedElement.style.outline = ''
      selectedElement = null
    }
    event.stopPropagation()
  }

  const handleClick = (event: MouseEvent) => {
    const clickedElement = event.target as HTMLElement
    if (clickedElement && !clickedElement.classList.contains('opmurls')) {
      console.log('element chosen', clickedElement)
      addUrlsToCollection(clickedElement)

      event.preventDefault()
      event.stopPropagation()
    }
  }

  document.addEventListener('mouseover', handleMouseOver, true)
  document.addEventListener('mouseout', handleMouseOut, true)
  document.addEventListener('click', handleClick, true)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      console.log('unload clipper')

      document.removeEventListener('mouseover', handleMouseOver, true)
      document.removeEventListener('mouseout', handleMouseOut, true)
      document.removeEventListener('click', handleClick, true)

      if (selectedElement) {
        selectedElement.style.outline = ''
      }

      document.querySelector("#opmurls-overlay")?.remove()
      document.body.removeAttribute('omu-clipper-initialized')
    }
  })

  document.body.innerHTML += `
    <div id="opmurls-overlay" class="opmurls" style="z-index: 10000000; position: fixed; top: 10px; left: 10px; right: 10px; background: rgba(0, 0, 0, 0.9); color: #fff; border-radius: 10px; font-family: sans-serif;">
        <div class="opmurls" style="padding: 20px; float:right">
            <span class="opmurls" style="display: inline-block; margin-right:15px;"><span class="opmurls" id="collected-count">0</span> URLs</span>
            <strong class="opmurls" id="copytoclipboard" style="display: inline-block; margin-right:15px; cursor: pointer; text-decoration: underline;">Copy to Clipboard</strong>
            <strong class="opmurls" style="display: inline-block; margin-right:15px; cursor: pointer; text-decoration: underline;">View</strong>
            <strong class="opmurls" style="display: inline-block; cursor: pointer; text-decoration: underline;">Clear</strong>
        </div>
        <div class="opmurls" style="padding: 20px;">
            Select an element and click on it to extract links. Press <strong>escape</strong> to finish.
        </div>
    </div>
  `
  document.querySelector('.opmurls #copytoclipboard')?.addEventListener('click', () => {
    copyCollectionToClipboard()
    alert('URLs copied to clipboard.')
  })

  document.body.setAttribute('omu-clipper-initialized', '')
} else {
  console.log('clipper already initialized')
}
