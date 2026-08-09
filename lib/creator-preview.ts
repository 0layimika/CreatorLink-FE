export function requestCreatorPreviewRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('creator-preview:refresh'));
  }
}
