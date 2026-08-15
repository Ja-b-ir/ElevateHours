// Client-side only: whitelist-based HTML sanitizer for blog rich text.
// Keeps formatting tags (bold/italic/underline/lists/paragraphs), strips
// everything else (scripts, styles, event handlers, links, images, etc.)
// and strips all attributes from the tags it does keep.

const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'BR', 'P', 'DIV'])

export function sanitizeHtml(html) {
  if (typeof window === 'undefined' || !html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const walk = (node) => {
    const children = Array.from(node.childNodes)
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!ALLOWED_TAGS.has(child.tagName)) {
          // Unwrap disallowed elements: keep their text/children, drop the tag itself
          while (child.firstChild) node.insertBefore(child.firstChild, child)
          node.removeChild(child)
          continue
        } else {
          for (const attr of Array.from(child.attributes)) child.removeAttribute(attr.name)
          walk(child)
        }
      } else if (child.nodeType !== Node.TEXT_NODE) {
        node.removeChild(child)
      }
    }
  }

  walk(doc.body)
  return doc.body.innerHTML
}

export function htmlToPlainText(html) {
  if (typeof window === 'undefined' || !html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

export function countWords(html) {
  const text = htmlToPlainText(html).trim()
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}
