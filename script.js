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
document.querySelectorAll('a[href^="#"]:not(#cal-ics)').forEach(anchor => {
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

// Calendrier du controle de vie
const cal = document.getElementById('cal');
if (cal) {
    const toDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    const DAY = 86400000;
    const start = toDate(cal.dataset.start);
    const end = toDate(cal.dataset.end);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const plural = (n, w) => n + ' ' + w + (n > 1 ? 's' : '');
    const status = document.getElementById('cal-status');
    const fill = document.getElementById('cal-bar-fill');
    const total = Math.round((end - start) / DAY) + 1;

    if (today < start) {
        status.textContent = 'Début dans ' + plural(Math.round((start - today) / DAY), 'jour');
        fill.style.width = '0%';
    } else if (today <= end) {
        const left = Math.round((end - today) / DAY);
        status.textContent = left === 0 ? 'Dernier jour du contrôle' : 'En cours : ' + plural(left, 'jour') + ' restant' + (left > 1 ? 's' : '');
        fill.style.width = Math.min(100, Math.round(((today - start) / DAY + 1) / total * 100)) + '%';
    } else {
        status.textContent = 'Cette période de contrôle est terminée';
        fill.style.width = '100%';
    }

    // Fichier .ics (Apple, Outlook, Google via import)
    const ymd = d => d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    const endExclusive = new Date(end.getTime() + DAY);
    const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Les M@JUSCULES//FR', 'BEGIN:VEVENT',
        'UID:controle-de-vie-' + ymd(start) + '@lesmajuscules.org',
        'DTSTAMP:' + ymd(today) + 'T000000Z',
        'DTSTART;VALUE=DATE:' + ymd(start),
        'DTEND;VALUE=DATE:' + ymd(endExclusive),
        'SUMMARY:Controle de vie CNSS',
        'DESCRIPTION:Periode du controle de vie. Dates a confirmer aupres de la CNSS.',
        'BEGIN:VALARM', 'TRIGGER:-P7D', 'ACTION:DISPLAY', 'DESCRIPTION:Controle de vie dans 7 jours', 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const link = document.getElementById('cal-ics');
    link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    link.download = 'controle-de-vie-2026.ics';
}

// Bande d'annonce : pause du defilement
const tickerPause = document.getElementById('ticker-pause');
if (tickerPause) {
    tickerPause.addEventListener('click', () => {
        const paused = tickerPause.closest('.ticker').classList.toggle('paused');
        tickerPause.setAttribute('aria-pressed', paused);
        tickerPause.setAttribute('aria-label', paused ? 'Reprendre le défilement' : 'Mettre en pause le défilement');
        tickerPause.innerHTML = paused ? '&#9654;' : '&#10074;&#10074;';
    });
}
