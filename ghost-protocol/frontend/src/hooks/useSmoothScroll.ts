export function useSmoothScroll() {
  const scrollToSection = (sectionId: string, offset = -80) => {
    const el = document.getElementById(sectionId)
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset + offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return { scrollToSection }
}
