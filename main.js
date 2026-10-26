const langSelected = document.getElementById('lang-selected')
const langDropdown = document.getElementById('lang-dropdown')
const currentLangFlag = document.getElementById('current-lang-flag')
const currentLangName = document.getElementById('current-lang-name')

function applyTranslations(lang) {
    const dict = translations[lang] || {}

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n')
        if (el.dataset.i18nOriginal === undefined) {
            if (!dict[key]) return
            el.dataset.i18nOriginal = el.innerHTML
        }
        el.innerHTML = dict[key] || el.dataset.i18nOriginal
    })

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const attr = el.tagName === 'VIDEO' ? 'aria-label' : 'alt'
        const key = el.getAttribute('data-i18n-alt')
        if (el.dataset.i18nOriginalAlt === undefined) {
            if (!dict[key]) return
            el.dataset.i18nOriginalAlt = el.getAttribute(attr) || ''
        }
        el.setAttribute(attr, dict[key] || el.dataset.i18nOriginalAlt)
    })

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title')
        if (el.dataset.i18nOriginalTitle === undefined) {
            if (!dict[key]) return
            el.dataset.i18nOriginalTitle = el.getAttribute('title') || ''
        }
        el.setAttribute('title', dict[key] || el.dataset.i18nOriginalTitle)
    })
    
    const flagMap = {
        'cs': 'assets/lang-flags/cz.png',
        'en': 'assets/lang-flags/en.png',
        'de': 'assets/lang-flags/de.png',
        'pl': 'assets/lang-flags/pl.png',
        'ro': 'assets/lang-flags/ro.png',
        'tr': 'assets/lang-flags/tr.png'
    }
    const nameMap = {
        'cs': 'Čeština',
        'en': 'English',
        'de': 'Deutsch',
        'pl': 'Polski',
        'ro': 'Română',
        'tr': 'Türkçe'
    }
    
    if (flagMap[lang]) currentLangFlag.src = flagMap[lang]
    if (nameMap[lang]) currentLangName.textContent = nameMap[lang]    
    document.documentElement.lang = lang
}

langSelected.addEventListener('click', () => {
    langDropdown.classList.toggle('open')
})

const savedLang = localStorage.getItem('lorderon_lang') || 'en'
applyTranslations(savedLang)

document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => {
        const lang = option.getAttribute('data-value')
        if (lang === 'en') {
            localStorage.setItem('lorderon_lang', 'en')
            location.reload()
            return
        }
        localStorage.setItem('lorderon_lang', lang)
        applyTranslations(lang)
        langDropdown.classList.remove('open')
    })
})

window.addEventListener('click', (e) => {
    if (!langSelected.contains(e.target) && !langDropdown.contains(e.target)) {
        langDropdown.classList.remove('open')
    }
})

function isInViewport(el) {
    const rect = el.getBoundingClientRect()
    return rect.bottom >= 0 && rect.top <= window.innerHeight
}

let videoPreviews = []
const visibleVideos = new Set()
let navScrolling = false

function syncVideoPreviews() {
    if (navScrolling) return
    videoPreviews.forEach(video => {
        if (visibleVideos.has(video)) {
            video.preload = 'auto'
            const playing = video.play()
            if (playing) playing.catch(() => {})
        } else if (!video.paused) {
            video.pause()
        }
    })
}

function initVideoPreviews() {
    videoPreviews = Array.from(document.querySelectorAll('video[data-lazy]'))
    if (!videoPreviews.length) return
    if (!('IntersectionObserver' in window)) {
        videoPreviews.forEach(video => video.play().catch(() => {}))
        return
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) visibleVideos.add(entry.target)
            else visibleVideos.delete(entry.target)
        })
        syncVideoPreviews()
    }, { rootMargin: '100px 0px', threshold: 0.01 })
    videoPreviews.forEach(video => observer.observe(video))
}

function holdVideoPreviews() {
    navScrolling = true
    videoPreviews.forEach(video => { if (!video.paused) video.pause() })
    const startY = window.pageYOffset
    const startedAt = Date.now()
    let lastY = startY
    let still = 0
    let timer = null
    let limit = null
    const takeover = ['wheel', 'touchstart', 'keydown', 'mousedown']
    const release = () => {
        clearInterval(timer)
        clearTimeout(limit)
        takeover.forEach(type => window.removeEventListener(type, release))
        navScrolling = false
        document.documentElement.classList.remove('nav-jump')
        syncVideoPreviews()
        syncActiveSection()
    }
    takeover.forEach(type => window.addEventListener(type, release, { passive: true }))
    timer = setInterval(() => {
        const y = window.pageYOffset
        if (Math.abs(y - startY) > 5 || Date.now() - startedAt > 4000) still = Math.abs(y - lastY) < 1 ? still + 1 : 0
        lastY = y
        if (still >= 3) release()
    }, 100)
    limit = setTimeout(release, 20000)
}

function initStableHover() {
    const selector = '.aura-evo-card, .talisman-card, .skill-box, .skill-item, .event-card-item, .location-card, ' +
        '.character-card, .social-btn, #back-to-top, .character-render, .char-image img, .flag-item img, .sash-renders img'
    const active = new Map()
    let pointerX = -1
    let pointerY = -1
    let frame = 0

    const restBox = el => {
        const r = el.getBoundingClientRect()
        return { left: r.left + window.pageXOffset, right: r.right + window.pageXOffset, top: r.top + window.pageYOffset, bottom: r.bottom + window.pageYOffset }
    }
    const inside = (box, x, y) => x >= box.left && x <= box.right && y >= box.top && y <= box.bottom

    const update = () => {
        frame = 0
        const under = pointerX < 0 ? null : document.elementFromPoint(pointerX, pointerY)
        const target = under ? under.closest(selector) : null
        const pageX = pointerX + window.pageXOffset
        const pageY = pointerY + window.pageYOffset
        active.forEach((rest, el) => {
            if (el === target) return
            const r = el.getBoundingClientRect()
            const current = { left: r.left + window.pageXOffset, right: r.right + window.pageXOffset, top: r.top + window.pageYOffset, bottom: r.bottom + window.pageYOffset }
            if (pointerX >= 0 && (inside(rest, pageX, pageY) || inside(current, pageX, pageY))) return
            el.classList.remove('is-hover')
            active.delete(el)
        })
        if (target && !active.has(target)) {
            active.set(target, restBox(target))
            target.classList.add('is-hover')
        }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }

    document.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return
        pointerX = e.clientX
        pointerY = e.clientY
        schedule()
    }, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    document.documentElement.addEventListener('mouseleave', () => {
        pointerX = -1
        pointerY = -1
        schedule()
    })
}

function initImageLoaders() {
    const images = document.querySelectorAll('img[loading="lazy"]')
    images.forEach(img => {
        const parent = img.parentElement
        const handleLoad = () => {
            img.classList.add('loaded')
            if (parent) parent.classList.remove('img-placeholder')
        }
        if (img.complete) {
            handleLoad()
        } else {
            if (parent) parent.classList.add('img-placeholder')
            img.addEventListener('load', handleLoad)
        }
        img.addEventListener('error', () => {
            img.classList.add('loaded')
            if (parent) parent.classList.remove('img-placeholder')
            img.style.filter = 'none'
        })
    })
}

function initSkillTreeMap() {
    const nodes = document.querySelectorAll('.st-node')
    if (!nodes.length) return
    nodes.forEach(node => {
        node.addEventListener('click', (e) => {
            e.stopPropagation()
            const open = node.classList.contains('is-open')
            nodes.forEach(n => n.classList.remove('is-open'))
            if (!open) node.classList.add('is-open')
        })
    })
    document.addEventListener('click', () => {
        nodes.forEach(n => n.classList.remove('is-open'))
    })
}

document.addEventListener('DOMContentLoaded', () => {
    initImageLoaders()
    initVideoPreviews()
    initSkillTreeMap()
    initStableHover()
    const loader = document.getElementById('loading-screen')
    setTimeout(() => {
        loader.classList.add('fade-out')
    }, 100)
    const indicator = document.getElementById('loading-indicator')
    if (indicator) {
        const allLoaded = () => {
            const imgs = document.querySelectorAll('img[loading="lazy"]')
            return Array.from(imgs).every(img =>
                img.classList.contains('loaded') ||
                (img.complete && img.naturalWidth > 0) ||
                !isInViewport(img)
            )
        }
        const hide = () => {
            if (!indicator.classList.contains('hidden')) {
                indicator.classList.add('hidden')
            }
        }
        const tryHide = () => {
            if (allLoaded()) {
                hide()
                return true
            }
            return false
        }
        const interval = setInterval(() => {
            if (tryHide()) clearInterval(interval)
        }, 300)
        window.addEventListener('scroll', () => {
            if (tryHide()) clearInterval(interval)
        })
        setTimeout(hide, 5000)
    }

    if (window.location.hash) {
        scrollIntoViewWithImages(window.location.hash, 72, 'auto')
    }
})

const mobileToggle = document.querySelector('.mobile-toggle')
const sidebar = document.querySelector('.sidebar')
mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open')
    mobileToggle.classList.toggle('open')
})

function layoutTop(el) {
    let y = 0
    for (let node = el; node; node = node.offsetParent) y += node.offsetTop
    return y
}

function scrollIntoViewWithImages(targetId, offset = 72, behavior = 'smooth') {
    const target = document.querySelector(targetId)
    if (!target) return
    holdVideoPreviews()
    document.documentElement.classList.add('nav-jump')
    if (target.classList.contains('reveal')) target.classList.add('active')
    let lastY = -1
    const scrollToTarget = () => {
        const y = layoutTop(target) - offset
        if (Math.abs(y - lastY) > 1) {
            lastY = y
            window.scrollTo({ top: y, behavior })
        }
    }
    scrollToTarget()
    let ticks = 0
    const stabilizer = setInterval(() => {
        scrollToTarget()
        if (++ticks >= 15) clearInterval(stabilizer)
    }, 200)
    window.addEventListener('wheel', () => clearInterval(stabilizer), { once: true, passive: true })
    window.addEventListener('touchstart', () => clearInterval(stabilizer), { once: true, passive: true })
}

document.querySelectorAll('.sidebar ul li a').forEach(link => {
    link.addEventListener('click', (e) => {
        sidebar.classList.remove('open')
        mobileToggle.classList.remove('open')
        const targetId = link.getAttribute('href')
        if (!targetId || !targetId.startsWith('#')) return
        e.preventDefault()
        scrollIntoViewWithImages(targetId)
        setActiveLink(targetId.slice(1))
    })
})

document.querySelectorAll('.sidebar-group-title').forEach(title => {
    title.addEventListener('click', () => {
        const group = title.closest('.sidebar-group')
        if (!group) return
        group.classList.toggle('open')
    })
})

const revealSections = document.querySelectorAll('.reveal')
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active')
            revealObserver.unobserve(entry.target)
        }
    })
}, {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
})

revealSections.forEach(section => {
    revealObserver.observe(section)
})

const sections = document.querySelectorAll('section, header')
const navLinks = document.querySelectorAll('.sidebar ul li a')
let lastActive = ''
const backToTopBtn = document.getElementById('back-to-top')

function currentSectionId() {
    const docHeight = document.documentElement.scrollHeight
    const winHeight = window.innerHeight
    const atBottom = Math.abs(window.pageYOffset + winHeight - docHeight) < 40
    let current = ''
    if (atBottom) {
        const last = sections[sections.length - 1]
        current = last ? last.getAttribute('id') : current
    } else {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect()
            if (rect.top <= winHeight * 0.6) {
                current = section.getAttribute('id')
            }
        })
    }
    return current
}

function setActiveLink(current, smoothSidebar = true) {
    if (current === lastActive) return
    lastActive = current
    navLinks.forEach(link => {
        link.classList.remove('active')
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active')
            const group = link.closest('.sidebar-group')
            if (group && !group.classList.contains('open')) {
                const groups = document.querySelector('.sidebar-groups')
                if (groups) groups.classList.add('instant')
                document.querySelectorAll('.sidebar-group.open').forEach(other => other.classList.remove('open'))
                group.classList.add('open')
                if (groups) requestAnimationFrame(() => requestAnimationFrame(() => groups.classList.remove('instant')))
            }
            const sb = document.querySelector('.sidebar-groups')
            if (sb) {
                const linkTop = link.getBoundingClientRect().top - sb.getBoundingClientRect().top + sb.scrollTop
                const sbHeight = sb.clientHeight
                const scrollTop = sb.scrollTop
                if (linkTop < scrollTop || linkTop + link.offsetHeight > scrollTop + sbHeight) {
                    sb.scrollTo({
                        top: linkTop - sbHeight / 2 + link.offsetHeight / 2,
                        behavior: smoothSidebar ? 'smooth' : 'auto'
                    })
                }
            }
        }
    })
}

function syncActiveSection() {
    setActiveLink(currentSectionId())
}

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        backToTopBtn.classList.add('show')
    } else {
        backToTopBtn.classList.remove('show')
    }
    if (navScrolling) return
    setActiveLink(currentSectionId())
})

const canvas = document.getElementById('bg-canvas')
const ctx = canvas.getContext('2d')
let width, height
let particles = []

function init() {
    resize()
    createParticles()
    animate()
}

function resize() {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
    createParticles()
}

window.addEventListener('resize', resize)

class Particle {
    constructor() {
        this.reset()
    }
    reset() {
        this.x = Math.random() * width
        this.y = height + Math.random() * 100
        this.vx = (Math.random() - 0.5) * 1
        this.vy = -(Math.random() * 1.1 + 0.35)
        this.size = Math.random() * 1.8 + 0.8
        this.alpha = 1
        this.color = Math.random() > 0.5 ? '#ff4500' : '#ff8c00'
        this.maxLife = Math.random() * 250 + 200
        this.life = 0
    }
    update() {
        this.x += this.vx
        this.y += this.vy
        this.life++
        this.alpha = 1 - (this.life / this.maxLife)
        if (this.life >= this.maxLife || this.y < -10) {
            this.reset()
        }
    }
    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha * 0.85
        ctx.fillStyle = this.color
        ctx.shadowBlur = 5
        ctx.shadowColor = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
    }
}

function createParticles() {
    particles = []
    const count = Math.floor((width * height) / 12000) + 30
    for (let i = 0; i < count; i++) {
        particles.push(new Particle())
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height)
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, '#050505')
    grad.addColorStop(1, '#1a0500')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)
    particles.forEach(p => {
        p.update()
        p.draw()
    })
    requestAnimationFrame(animate)
}

init()

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
})

function showTab(tabId, button) {
    const contents = document.querySelectorAll('.tab-content')
    contents.forEach(content => content.classList.remove('active'))
    const buttons = document.querySelectorAll('.tab-button')
    buttons.forEach(btn => btn.classList.remove('active'))

    document.getElementById(tabId).classList.add('active')
    button.classList.add('active')
}

const lightbox = document.getElementById('lightbox')
if (lightbox) {
    initLightbox()
}

function initLightbox() {
    const lightboxImg = lightbox.querySelector('.lightbox-img')
    const lightboxCaption = lightbox.querySelector('.lightbox-caption')
    let lightboxItems = []
    let lightboxIndex = 0

function collectLightboxItems() {
        lightboxItems = []
        document.querySelectorAll('.location-card').forEach(card => {
            const img = card.querySelector('.location-image')
            if (img) {
                lightboxItems.push({
                    src: img.getAttribute('src'),
                    alt: img.getAttribute('alt') || '',
                    caption: (card.querySelector('.location-name') || {}).textContent || ''
                })
            }
        })
    }

function openLightbox(index) {
    if (index < 0 || index >= lightboxItems.length) return
    lightboxIndex = index
    const item = lightboxItems[index]
    lightboxImg.src = item.src
    lightboxImg.alt = item.alt
    lightboxCaption.textContent = item.caption
    lightbox.classList.add('open')
    document.body.style.overflow = 'hidden'
}

function closeLightbox() {
    lightbox.classList.remove('open')
    document.body.style.overflow = ''
}

document.querySelector('.lightbox-close').addEventListener('click', closeLightbox)
document.querySelector('.lightbox-prev').addEventListener('click', () => {
    openLightbox((lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length)
})

document.querySelector('.lightbox-next').addEventListener('click', () => {
    openLightbox((lightboxIndex + 1) % lightboxItems.length)
})

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox()
})

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') openLightbox((lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length)
    if (e.key === 'ArrowRight') openLightbox((lightboxIndex + 1) % lightboxItems.length)
})

document.addEventListener('click', (e) => {
        const card = e.target.closest('.location-card')
        if (!card) return
        const img = card.querySelector('.location-image')
        if (!img) return
        collectLightboxItems()
        openLightbox(lightboxItems.findIndex(item => item.src === img.getAttribute('src')))
    })
    collectLightboxItems()
}
