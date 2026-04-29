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
        }
    })
}, {
    threshold: 0.15
})

revealSections.forEach(section => {
    revealObserver.observe(section)
})

const sections = document.querySelectorAll('section, header')
const navLinks = document.querySelectorAll('.sidebar ul li a')
let lastActive = ''

window.addEventListener('scroll', () => {
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
