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

// Copier le numero de don
const copyBtn = document.getElementById('don-copy');
if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        const number = document.getElementById('don-number').textContent.replace(/\s/g, '');
        try {
            await navigator.clipboard.writeText(number);
            copyBtn.textContent = 'Numéro copié';
        } catch (e) {
            copyBtn.textContent = number;
        }
        setTimeout(() => { copyBtn.textContent = 'Copier le numéro'; }, 2500);
    });
}

// Formulaire benevoles : envoi sans quitter la page
const form = document.getElementById('volunteer-form');
if (form) {
    const submitBtn = form.querySelector('.form-submit');
    const errorBox = document.getElementById('form-error');
    const success = document.getElementById('form-success');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        errorBox.hidden = true;
        submitBtn.disabled = true;
        const label = submitBtn.textContent;
        submitBtn.textContent = 'Envoi en cours...';
        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            form.hidden = true;
            success.hidden = false;
            success.focus();
            form.reset();
        } catch (err) {
            errorBox.innerHTML = "L'envoi a échoué. Réessayez, ou écrivez-nous à <a href=\"mailto:contact@lesmajuscules.org\">contact@lesmajuscules.org</a> ou sur <a href=\"https://wa.me/22898561901\">WhatsApp</a>.";
            errorBox.hidden = false;
            submitBtn.disabled = false;
            submitBtn.textContent = label;
        }
    });
}
