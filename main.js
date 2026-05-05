const langSelected = document.getElementById('lang-selected')
const langDropdown = document.getElementById('lang-dropdown')
const currentLangFlag = document.getElementById('current-lang-flag')
const currentLangName = document.getElementById('current-lang-name')

function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n')
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key]
        }
    })
    
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const key = el.getAttribute('data-i18n-alt')
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('alt', translations[lang][key])
        }
    })

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title')
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('title', translations[lang][key])
        }
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

document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => {
        const lang = option.getAttribute('data-value')
        applyTranslations(lang)
        langDropdown.classList.remove('open')
    })
})

window.addEventListener('click', (e) => {
    if (!langSelected.contains(e.target) && !langDropdown.contains(e.target)) {
        langDropdown.classList.remove('open')
    }
})

applyTranslations('en')

window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen')
    setTimeout(() => {
        loader.classList.add('fade-out')
    }, 500)
})

const mobileToggle = document.querySelector('.mobile-toggle')
const sidebar = document.querySelector('.sidebar')
mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open')
    mobileToggle.classList.toggle('open')
})

document.querySelectorAll('.sidebar ul li a').forEach(link => {
    link.addEventListener('click', () => {
        sidebar.classList.remove('open')
        mobileToggle.classList.remove('open')
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

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        backToTopBtn.classList.add('show')
    } else {
        backToTopBtn.classList.remove('show')
    }
    let current = ''
    sections.forEach(section => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.clientHeight
        if (pageYOffset >= (sectionTop - 250)) {
            current = section.getAttribute('id')
        }
    })

    if (current !== lastActive) {
        lastActive = current
        navLinks.forEach(link => {
            link.classList.remove('active')
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active')
                link.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            }
        })
    }
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
        this.vy = -(Math.random() * 1.5 + 0.5)
        this.size = Math.random() * 2 + 1
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
        ctx.globalAlpha = this.alpha
        ctx.fillStyle = this.color
        ctx.shadowBlur = 15
        ctx.shadowColor = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
    }
}

function createParticles() {
    particles = []
    const count = Math.floor((width * height) / 8000) + 40;
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
