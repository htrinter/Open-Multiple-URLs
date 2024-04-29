if (!document.body.hasAttribute('omu-clipper-initialized')) {
  console.log('initialize clipper')
  let collectedUrls: string[] = []
  let hoveredElement: HTMLElement | null = null
  const selectedElements: HTMLElement[] = []

  const setCollectedCount = () => {
    const collectedCountEl = document.querySelector('#collected-count')
    if (collectedCountEl) {
      collectedCountEl.innerHTML = String(collectedUrls.length)
    }
  }

  const extractLinksFromElement = (selectedElement: HTMLElement): string[] => {
    const inspectedElement =
      selectedElement.parentElement?.tagName.toLowerCase() === 'a'
        ? selectedElement.parentElement.cloneNode(true)
        : selectedElement.cloneNode(true)

    const wrapper = document.createElement('div')
    wrapper.appendChild(inspectedElement)

    return Array.from(wrapper.querySelectorAll('a'))
      .map((link) => {
        const href = link.getAttribute('href')
        if (href) {
          const prependProtocol = !href.startsWith(window.location.protocol)
          const prependHost = prependProtocol && !href.startsWith(window.location.host)
          const prependPath = prependHost && !href.startsWith('/')

          return `${prependProtocol ? `${window.location.protocol}//` : ''}${
            prependHost ? window.location.host : ''
          }${
            prependPath
              ? `${window.location.pathname}${!window.location.pathname.endsWith('/') ? '/' : ''}`
              : ''
          }${href}`
        }
      })
      .filter((u) => u !== undefined) as string[]
  }

  const addUrlsToCollection = (element: HTMLElement) => {
    const urls = extractLinksFromElement(element)
    collectedUrls.push(...urls)
    setCollectedCount()
  }

  const removeUrlsFromCollection = (element: HTMLElement) => {
    const urls = extractLinksFromElement(element)
    urls.forEach((url) => {
      delete collectedUrls[collectedUrls.indexOf(url)]
    })
    collectedUrls = collectedUrls.filter((u) => u)
    setCollectedCount()
  }

  const copyCollectionToClipboard = () => {
    navigator.clipboard.writeText(collectedUrls.join('\n'))
  }

  const handleMouseOver = (event: MouseEvent) => {
    if (
      hoveredElement !== event.target &&
      !(event.target as HTMLElement).classList.contains('opmurls')
    ) {
      if (hoveredElement) {
        hoveredElement.style.outline = ''
      }
      hoveredElement = event.target as HTMLElement
      hoveredElement.style.outline = '4px solid blue'
    }
    event.stopPropagation()
  }

  const handleMouseOut = (event: MouseEvent) => {
    if (
      hoveredElement &&
      hoveredElement === event.target &&
      !(event.target as HTMLElement).classList.contains('opmurls')
    ) {
      hoveredElement.style.outline = ''
      hoveredElement = null
    }
    event.stopPropagation()
  }

  const handleClick = (event: MouseEvent) => {
    const clickedElement = event.target as HTMLElement
    if (clickedElement && !clickedElement.classList.contains('opmurls')) {
      console.log('element chosen', clickedElement)

      if (selectedElements.includes(clickedElement)) {
        removeUrlsFromCollection(clickedElement)
        delete selectedElements[selectedElements.indexOf(clickedElement)]
        clickedElement.style.border = 'none'
      } else {
        addUrlsToCollection(clickedElement)
        selectedElements.push(clickedElement)
        clickedElement.style.border = '5px solid green'
      }

      event.preventDefault()
      event.stopPropagation()
    }
  }

  document.addEventListener('mouseover', handleMouseOver, true)
  document.addEventListener('mouseout', handleMouseOut, true)
  document.addEventListener('click', handleClick, true)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      copyCollectionToClipboard()

      console.log('unload clipper')

      document.removeEventListener('mouseover', handleMouseOver, true)
      document.removeEventListener('mouseout', handleMouseOut, true)
      document.removeEventListener('click', handleClick, true)

      if (hoveredElement) {
        hoveredElement.style.outline = ''
      }

      document.querySelector('#opmurls-overlay')?.remove()
      document.body.removeAttribute('omu-clipper-initialized')
    }
  })

  document.body.innerHTML += `
    <div id="opmurls-overlay" class="opmurls" style="z-index: 237237424034324; position: fixed; top: 10px; left: 10px; right: 10px; background: rgba(0, 0, 0, 0.9); color: #fff; border-radius: 10px; font-family: sans-serif;">
        <div class="opmurls" style="padding: 20px; float:right">
            <span class="opmurls" style="display: inline-block; margin-right:15px;"><span class="opmurls" id="collected-count">0</span> URLs</span>
            <strong class="opmurls" id="copytoclipboard" style="display: inline-block; cursor: pointer; text-decoration: underline;">Copy to clipboard</strong>
        </div>
        <div class="opmurls" style="padding: 20px;">
            Select elements by clicking on them to extract links. Click again for deselect. Press <strong>escape</strong> to finish and copy to clipboard.
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
