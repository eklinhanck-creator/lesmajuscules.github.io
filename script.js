// Menu mobile
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-links');
const setMenu = open => {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? '\u2715' : '\u2630';
};
toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// Defilement doux (desactive si l'utilisateur reduit les animations)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        setMenu(false);
    });
});

// Lien actif dans le menu
const links = [...document.querySelectorAll('.nav-links a')];
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
        }
    });
}, { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('main section[id], section[id]').forEach(s => observer.observe(s));
document.getElementById('year').textContent = new Date().getFullYear();
