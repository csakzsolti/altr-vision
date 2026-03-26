function updateSectionKickers(lang) {
            Object.entries(sectionKickers[lang]).forEach(([id, kicker]) => {
                const el = document.getElementById(id);
                if (el) el.setAttribute('data-kicker', kicker);
            });
        }

        function renderProjectCards(lang) {
            document.querySelectorAll('.content-grid .card').forEach(card => {
                const href = card.getAttribute('href');
                const config = projectCardContent[lang][href];
                const content = card.querySelector('.card-content');
                if (!config || !content) return;

                const tagsHtml = config.tags.map((tag, index) => `<span class="tag">${tag}</span>`).join('');
                const metaHtml = config.meta.map(item => `
                    <div class="card-meta-item" style="--meta-accent: ${config.metaAccent};">
                        <span class="card-meta-label">${item.label}</span>
                        <span class="card-meta-value">${item.value}</span>
                    </div>
                `).join('');

                content.innerHTML = `
                    <div class="card-head">
                        <div>
                            <div>${tagsHtml}</div>
                            <h2 style="color: ${config.color};">${config.title}</h2>
                        </div>
                        <span class="card-index">${config.index}</span>
                    </div>
                    <p class="card-copy">${config.desc}</p>
                    <div class="card-meta">${metaHtml}</div>
                `;
            });
        }

        function updatePageMeta(lang) {
            const copy = translations[lang];
            document.title = copy["meta-title"];

            const description = document.getElementById('meta-description');
            const ogTitle = document.getElementById('meta-og-title');
            const ogDescription = document.getElementById('meta-og-description');
            const twitterTitle = document.getElementById('meta-twitter-title');
            const twitterDescription = document.getElementById('meta-twitter-description');

            if (description) description.setAttribute('content', copy["meta-description"]);
            if (ogTitle) ogTitle.setAttribute('content', copy["meta-og-title"]);
            if (ogDescription) ogDescription.setAttribute('content', copy["meta-og-description"]);
            if (twitterTitle) twitterTitle.setAttribute('content', copy["meta-og-title"]);
            if (twitterDescription) twitterDescription.setAttribute('content', copy["meta-og-description"]);
        }

        function updateNavStatus() {
            const valueEl = document.getElementById('nav-status-value');
            const statusEl = document.getElementById('nav-status');
            if (!valueEl || !statusEl) return;

            const now = new Date();
            const time = now.toLocaleTimeString(currentLang === 'en' ? 'en-GB' : 'hu-HU', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const huModes = [
                "STÚDIÓ ÜZEM",
                "KÁVÉFÁZIS",
                "ÉJFÉLI BUILD",
                "NEON JEL"
            ];
            const enModes = [
                "STUDIO MODE",
                "COFFEE PHASE",
                "MIDNIGHT BUILD",
                "NEON SIGNAL"
            ];

            const modes = currentLang === 'en' ? enModes : huModes;
            const mode = modes[Math.floor(now.getMinutes() / 15) % modes.length];
            statusEl.firstChild.textContent = currentLang === 'en' ? "LIVE // " : "LIVE // ";
            valueEl.textContent = `${mode} ${time}`;
        }

        let currentLang = localStorage.getItem('selectedLang') || 'hu';
        let isOverdrive = false;
        function animateI18nSwap(el, html) {
            if (!el) return;
            el.classList.add('switching');
            clearTimeout(el._i18nTimer);
            el._i18nTimer = window.setTimeout(() => {
                el.innerHTML = html;
                requestAnimationFrame(() => el.classList.remove('switching'));
            }, 120);
        }

        function setLang(lang) {
                currentLang = lang;
                Object.keys(translations[lang]).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        const content = (id === "hero-text" && isOverdrive) ? translations[lang]["hero-overdrive"] : translations[lang][id];
                        if (el.classList.contains('i18n-fade')) animateI18nSwap(el, content);
                        else el.innerHTML = content;
                    }
                });
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                document.getElementById('btn-' + lang).classList.add('active');
                localStorage.setItem('selectedLang', lang);
                document.documentElement.lang = lang;
                updateSectionKickers(lang);
                renderProjectCards(lang);
                updatePageMeta(lang);
                updateNavStatus();

                // EZT ADD HOZZÁ: Küldjük át a nyelvet a játéknak (iframe)
                const gameFrame = document.getElementById('game-frame');
                if (gameFrame && gameFrame.contentWindow) {
                    gameFrame.contentWindow.postMessage({ type: 'SET_LANG', lang: lang }, '*');
                }
            }


        setLang(currentLang);
        updateNavStatus();
        window.setInterval(updateNavStatus, 15000);
        document.querySelectorAll('#signal[hidden] [id]').forEach((el) => el.removeAttribute('id'));
        const embeddedGameFrame = document.getElementById('game-frame');
        if (embeddedGameFrame && !embeddedGameFrame.src.endsWith('game.html')) {
            embeddedGameFrame.src = 'game.html';
        }

        const cursor = document.getElementById('cursor');
        let mouseX = -100, mouseY = -100;
        let hasMoved = false;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if(!hasMoved) { hasMoved = true; cursor.style.opacity = "1"; }
        });

        function renderCursor() {
            if (hasMoved && window.innerWidth > 768) {
                cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(renderCursor);
        }

        const logo = document.getElementById('main-logo');
        let particleSpeedBoost = 1;
        let clickCount = 0;
        let typedSecret = "";
        let clickTimer;
        let glitchTimer;
        let glitchAnimation;

        function triggerShake() {
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 400);
        }

        function toggleOverdrive() {
            isOverdrive = !isOverdrive;
            document.body.classList.toggle('overdrive');
            triggerShake();
            
            const heroText = document.getElementById('hero-text');
            const scrollIndicator = document.getElementById('scroll-indicator');
            if (isOverdrive) {
                particleSpeedBoost = 5;
                heroText.innerHTML = translations[currentLang]["hero-overdrive"];
                scrollIndicator.classList.add('is-hidden');
            } else {
                particleSpeedBoost = 1;
                heroText.innerHTML = translations[currentLang]["hero-text"];
                if (window.scrollY < 40) scrollIndicator.classList.remove('is-hidden');
            }
        }

        function triggerLogoGlitch() {
            logo.classList.remove('logo-glitch');
            void logo.offsetWidth;
            logo.classList.add('logo-glitch');

            if (glitchAnimation) glitchAnimation.cancel();
            glitchAnimation = logo.animate([
                {
                    transform: 'translate(0, 0) skew(0deg) scale(1)',
                    filter: 'drop-shadow(0 0 18px rgba(0, 229, 255, 0.18))'
                },
                {
                    transform: 'translate(-5px, 5px) skew(5deg) scale(1.02)',
                    filter: 'drop-shadow(-10px 0 0 rgba(255, 0, 127, 0.95)) drop-shadow(10px 0 0 rgba(0, 229, 255, 0.95)) drop-shadow(0 0 24px rgba(255, 0, 127, 0.45))',
                    offset: 0.2
                },
                {
                    transform: 'translate(-5px, -5px) scale(1.08)',
                    filter: 'drop-shadow(12px 0 0 rgba(255, 0, 127, 0.9)) drop-shadow(-12px 0 0 rgba(0, 229, 255, 0.9)) drop-shadow(0 0 28px rgba(0, 229, 255, 0.4))',
                    offset: 0.4
                },
                {
                    transform: 'translate(5px, 5px) skew(-5deg) scale(1.02)',
                    filter: 'drop-shadow(-9px 0 0 rgba(255, 0, 127, 0.95)) drop-shadow(9px 0 0 rgba(0, 229, 255, 0.95)) drop-shadow(0 0 24px rgba(255, 255, 255, 0.2))',
                    offset: 0.6
                },
                {
                    transform: 'translate(5px, -5px)',
                    filter: 'drop-shadow(7px 0 0 rgba(255, 0, 127, 0.85)) drop-shadow(-7px 0 0 rgba(0, 229, 255, 0.85))',
                    offset: 0.8
                },
                {
                    transform: 'translate(0, 0) skew(0deg) scale(1)',
                    filter: 'drop-shadow(0 0 30px rgba(156, 39, 176, 0.4))',
                    offset: 1
                }
            ], {
                duration: 420,
                easing: 'cubic-bezier(.25,.46,.45,.94)',
                iterations: 1
            });

            clearTimeout(glitchTimer);
            glitchTimer = setTimeout(() => {
                logo.classList.remove('logo-glitch');
            }, 420);
        }

        // JAVÍTOTT LOGÓ KATTINTÁS LOGIKA
        logo.addEventListener('click', () => {
            clickCount++;
            triggerLogoGlitch();

            clearTimeout(clickTimer);
            if (clickCount === 3) { 
                toggleOverdrive(); 
                clickCount = 0; 
            } else { 
                clickTimer = setTimeout(() => { clickCount = 0; }, 2000); 
            }
        });

        document.addEventListener('keydown', (e) => {
            typedSecret += e.key.toLowerCase();
            if (typedSecret.endsWith("altr")) { toggleOverdrive(); typedSecret = ""; }
            if (typedSecret.length > 10) typedSecret = typedSecret.substring(1);
        });

        const scrollIndicator = document.getElementById('scroll-indicator');
        const dockLinks = Array.from(document.querySelectorAll('.floating-dock .dock-link'));

        function updateScrollIndicator() {
            if (isOverdrive || window.scrollY > 40) scrollIndicator.classList.add('is-hidden');
            else scrollIndicator.classList.remove('is-hidden');
        }

        function updateActiveDockLink(activeId) {
            dockLinks.forEach(link => {
                const targetId = link.getAttribute('href').slice(1);
                link.classList.toggle('active', targetId === activeId);
            });
        }

        function initDockTracking() {
            const sectionIds = ['home', 'projects', 'vision', 'contact'];
            const sections = sectionIds
                .map(id => document.getElementById(id))
                .filter(Boolean);

            if (!sections.length) return;

            const observer = new IntersectionObserver((entries) => {
                const visibleEntries = entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visibleEntries.length > 0) {
                    updateActiveDockLink(visibleEntries[0].target.id);
                }
            }, {
                rootMargin: '-20% 0px -35% 0px',
                threshold: [0.15, 0.3, 0.55]
            });

            sections.forEach(section => observer.observe(section));

            const initialHash = window.location.hash ? window.location.hash.slice(1) : 'home';
            updateActiveDockLink(sectionIds.includes(initialHash) ? initialHash : 'home');
        }

        function syncDockWithScrollTop() {
            if (window.scrollY < 120) {
                updateActiveDockLink('home');
            }
        }

        document.addEventListener('pointerdown', (e) => {
            if(e.target.closest('button') || e.target.closest('a') || e.target.id === 'game-frame') return;
            const ripple = document.createElement('div');
            ripple.className = 'click-effect';
            ripple.style.left = e.clientX + 'px'; ripple.style.top = e.clientY + 'px';
            document.body.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });

        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        let particles = [];

        function initParticles() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            let count = window.innerWidth < 600 ? 30 : 70;
            for(let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.4,
                    speedY: (Math.random() - 0.5) * 0.4,
                    opacity: Math.random()
                });
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                if (isOverdrive && hasMoved) {
                    let dx = mouseX - p.x;
                    let dy = mouseY - p.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 300) {
                        p.x += dx * 0.01;
                        p.y += dy * 0.01;
                    }
                }
                p.x += p.speedX * particleSpeedBoost;
                p.y += p.speedY * particleSpeedBoost;
                if(p.x > canvas.width) p.x = 0; if(p.x < 0) p.x = canvas.width;
                if(p.y > canvas.height) p.y = 0; if(p.y < 0) p.y = canvas.height;

                ctx.fillStyle = isOverdrive ? `rgba(0, 255, 65, ${p.opacity})` : `rgba(0, 229, 255, ${p.opacity * 0.4})`;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', initParticles);
        window.addEventListener('scroll', updateScrollIndicator, { passive: true });
        window.addEventListener('scroll', syncDockWithScrollTop, { passive: true });
        initParticles();
        updateScrollIndicator();
        initDockTracking();
        syncDockWithScrollTop();
        renderCursor();
        animate();
