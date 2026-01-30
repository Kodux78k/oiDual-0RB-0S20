/**
 * FUSION OS v3.0 - LIVROVIVO EDITION (DUAL TAB)
 * Architecture: Widget Loader / Self-Contained / IIFE
 * Features: Permissões, Fusões Inteligentes, UI/UX Refinada
 * Layout: 2 abas - Dashboard (status + apps) e Configurações (lab + settings)
 */

const FusionOS = (() => {
    // ═══════════════════════════════════════════════════════════════════════
    // 1. CONFIG & PRIVATE STATE
    // ═══════════════════════════════════════════════════════════════════════
    const CONFIG = {
        key: 'fusion_os_v3_state',
        rootId: 'fusion-os-root',
        fusionLayerId: 'navRoot',
        customCssRootId: 'custom-css-root',
        monolithId: 'monolith',
        orbTriggerId: 'orbTrigger',
        runtimeLayerId: 'os-runtime',
        runtimeFrameId: 'os-frame',
        fusionExitBtnId: 'fusion-exit-ctrl',
        storageKey: 'fusion_os_v3_enhanced',
        voice: true,
    };

    const DEFAULT_APPS = [
        { 
            id: 'DELTA', 
            name: 'Delta Hub', 
            desc: 'Interface de conexão externa.', 
            url: 'https://kodux78k.github.io/DualInfodose-VirgemHuB/index.html', 
            icon: 'globe', 
            active: true, 
            permissions: ['NETWORK', 'FUSION']
        },
        { 
            id: 'OIDUAL', 
            name: 'OiDual', 
            desc: 'Sistema de comunicação dual.', 
            url: 'https://kodux78k.github.io/oiDual-dip/', 
            icon: 'message-circle', 
            active: true, 
            permissions: ['NETWORK']
        },
        { 
            id: 'VIVIVI', 
            name: 'Vivivi System', 
            desc: 'Sistema de identidade e autenticação.', 
            url: 'https://kodux78k.github.io/oiDual-Vivivi-1/', 
            icon: 'fingerprint', 
            active: true, 
            permissions: ['STORAGE', 'IDENTITY']
        }
    ];

    let state = {
        active: false,
        currentTab: 'dashboard',
        apps: [...DEFAULT_APPS],
        hiddenApps: [],
        customCSS: '',
        userData: { 
            user: 'Visitante', 
            system: 'SINGULARITY', 
            stats: {
                appsInstalled: 3,
                fusionsActive: 0,
                uptime: '24h'
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 2. UTILITIES
    // ═══════════════════════════════════════════════════════════════════════
    const Utils = {
        save: () => {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify({
                apps: state.apps,
                hiddenApps: state.hiddenApps,
                customCSS: state.customCSS,
                userData: state.userData
            }));
        },

        load: () => {
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    state.apps = parsed.apps || [...DEFAULT_APPS];
                    state.hiddenApps = parsed.hiddenApps || [];
                    state.customCSS = parsed.customCSS || '';
                    state.userData = parsed.userData || state.userData;
                } catch (e) {
                    console.error('Erro ao carregar estado:', e);
                }
            }
        },

        speak: (msg) => {
            if (!CONFIG.voice || !('speechSynthesis' in window)) return;
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(msg);
                utterance.lang = 'pt-BR';
                utterance.rate = 1.15;
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn('TTS falhou:', e);
            }
        },

        shake: () => {
            document.body.style.animation = 'shake 0.32s ease-in-out';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 320);
        },

        injectDeps: () => {
            if (!document.querySelector('script[src*="tailwindcss"]')) {
                const s = document.createElement('script');
                s.src = 'https://cdn.tailwindcss.com';
                document.head.appendChild(s);
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 3. PERMISSIONS SYSTEM
    // ═══════════════════════════════════════════════════════════════════════
    const Permissions = {
        check: (appId, permission) => {
            const app = state.apps.find(a => a.id === appId);
            return app && app.permissions && app.permissions.includes(permission);
        },

        grant: (appId, permission) => {
            const app = state.apps.find(a => a.id === appId);
            if (app && !app.permissions.includes(permission)) {
                app.permissions.push(permission);
                Utils.save();
            }
        },

        revoke: (appId, permission) => {
            const app = state.apps.find(a => a.id === appId);
            if (app) {
                app.permissions = app.permissions.filter(p => p !== permission);
                Utils.save();
            }
        },

        getAll: (appId) => {
            const app = state.apps.find(a => a.id === appId);
            return app ? app.permissions : [];
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 4. SMART FUSION SYSTEM
    // ═══════════════════════════════════════════════════════════════════════
    const SmartFusion = {
        performFusion: async (app) => {
            const navRoot = document.getElementById(CONFIG.fusionLayerId) || document.body;

            if (state.active) {
                toggle();
            }

            document.getElementById(CONFIG.fusionExitBtnId).classList.remove('hidden');
            Utils.speak(`Iniciando fusão de ${app.name}.`);

            try {
                const response = await fetch(app.url);
                if (response.ok) {
                    const html = await response.text();
                    injectIntoDOM(navRoot, html);
                } else {
                    createIframe(navRoot, app.url);
                }
            } catch (e) {
                console.error('Erro na fusão:', e);
                createIframe(navRoot, app.url);
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 5. UI GENERATOR (STYLES & HTML)
    // ═══════════════════════════════════════════════════════════════════════
    const UI = {
        styles: `
            /* ═══════════════════════════════════════════════════════════════
               FUSION OS v3.0 - ENHANCED STYLESHEET (DUAL TAB)
               ═══════════════════════════════════════════════════════════════ */
            
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

            #${CONFIG.rootId} * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            #${CONFIG.rootId} {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: white;
                pointer-events: auto;
                --bg-primary: rgb(7, 11, 20);
                --bg-secondary: rgba(15, 23, 42, 0.8);
                --bg-tertiary: rgba(30, 41, 59, 0.6);
                --text-primary: rgb(234, 246, 255);
                --text-secondary: rgba(234, 246, 255, 0.7);
                --text-muted: rgba(234, 246, 255, 0.4);
                --border-light: rgba(255, 255, 255, 0.08);
                --border-medium: rgba(255, 255, 255, 0.15);
                --accent-cyan: #00f2ff;
                --accent-purple: #bd00ff;
                --accent-red: #ef4444;
                --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.3);
                --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
                --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.5);
                --radius-sm: 8px;
                --radius-md: 12px;
                --radius-lg: 16px;
                --radius-xl: 24px;
                --transition-fast: 0.16s ease;
                --transition-smooth: 0.3s cubic-bezier(0.19, 1, 0.22, 1);
                --transition-elastic: 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            /* ═══════════════════════════════════════════════════════════════
               SCROLLBAR
               ═══════════════════════════════════════════════════════════════ */
            #${CONFIG.rootId} ::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }

            #${CONFIG.rootId} ::-webkit-scrollbar-track {
                background: transparent;
            }

            #${CONFIG.rootId} ::-webkit-scrollbar-thumb {
                background: rgba(0, 242, 255, 0.16);
                border-radius: 10px;
            }

            #${CONFIG.rootId} ::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 242, 255, 0.24);
            }

            /* ═══════════════════════════════════════════════════════════════
               ANIMATIONS
               ═══════════════════════════════════════════════════════════════ */
            @keyframes orb-spin {
                to { transform: rotate(360deg); }
            }

            @keyframes orb-pulse {
                0%, 100% { box-shadow: 0 0 30px rgba(0, 242, 255, 0.6); }
                50% { box-shadow: 0 0 50px rgba(0, 242, 255, 0.8); }
            }

            @keyframes shake {
                0%, 100% { transform: translate(0); }
                10% { transform: translate(-2px, -2px); }
                20% { transform: translate(2px, 2px); }
                30% { transform: translate(-2px, 2px); }
                40% { transform: translate(2px, -2px); }
            }

            /* ═══════════════════════════════════════════════════════════════
               ORB TRIGGER
               ═══════════════════════════════════════════════════════════════ */
            .orb-trigger {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                width: 72px;
                height: 72px;
                cursor: pointer;
                z-index: 10010;
                display: grid;
                place-items: center;
                background: transparent;
                border: none;
                outline: none;
                pointer-events: auto;
                transition: transform var(--transition-elastic);
            }

            .orb-trigger:hover {
                transform: translateX(-50%) scale(1.08);
            }

            .orb-trigger:active {
                transform: translateX(-50%) scale(0.96);
            }

            .orb-core {
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 0 18px rgba(255, 255, 255, 0.95);
                transition: all var(--transition-smooth);
            }

            .orb-ring {
                position: absolute;
                width: 52px;
                height: 52px;
                border-radius: 50%;
                border: 2px solid transparent;
                border-top-color: var(--accent-cyan);
                border-bottom-color: var(--accent-purple);
                animation: orb-spin 4s linear infinite;
                opacity: 0.75;
                transition: all var(--transition-smooth);
            }

            .os-active .orb-core {
                background: var(--accent-cyan);
                box-shadow: 0 0 30px var(--accent-cyan);
                transform: scale(1.18);
                animation: orb-pulse 2s ease-in-out infinite;
            }

            .os-active .orb-ring {
                animation-duration: 1.25s;
                opacity: 1;
                border-color: var(--accent-cyan);
                box-shadow: 0 0 20px rgba(0, 242, 255, 0.18);
            }

            /* ═══════════════════════════════════════════════════════════════
               MONOLITH CONTAINER
               ═══════════════════════════════════════════════════════════════ */
            .monolith-wrapper {
                perspective: 2000px;
                z-index: 9998;
                pointer-events: none;
                position: fixed;
                inset: 0;
            }

            .monolith {
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%) translateY(60px) scale(0.9);
                width: 90%;
                max-width: 500px;
                height: 70vh;
                max-height: 600px;
                background: rgba(10, 10, 14, 0.95);
                backdrop-filter: blur(60px);
                border: 1px solid var(--border-medium);
                border-radius: var(--radius-xl);
                clip-path: circle(0% at 50% 100%);
                opacity: 0;
                transition: all var(--transition-smooth);
                pointer-events: none;
                overflow: hidden;
                box-shadow: var(--shadow-lg);
                display: flex;
                flex-direction: column;
            }

            .os-active .monolith {
                transform: translateX(-50%) translateY(0) scale(1);
                opacity: 1;
                clip-path: circle(150% at 50% 100%);
                pointer-events: auto;
            }

            /* ═══════════════════════════════════════════════════════════════
               HEADER WITH TAB NAVIGATION
               ═══════════════════════════════════════════════════════════════ */
            .monolith-header {
                padding: 20px 24px;
                border-bottom: 1px solid var(--border-light);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }

            .monolith-title {
                font-size: 16px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                color: var(--text-primary);
            }

            .monolith-title-accent {
                color: var(--accent-cyan);
                margin-left: 4px;
            }

            .tab-nav {
                display: flex;
                gap: 8px;
                padding: 0;
                margin: 0;
                list-style: none;
            }

            .tab-btn {
                width: 44px;
                height: 44px;
                border-radius: var(--radius-md);
                transition: all var(--transition-smooth);
                color: rgba(255, 255, 255, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: 1px solid transparent;
                cursor: pointer;
                outline: none;
                position: relative;
            }

            .tab-btn:hover {
                color: var(--text-primary);
                background: rgba(255, 255, 255, 0.04);
            }

            .tab-btn.active {
                color: var(--accent-cyan);
                background: rgba(0, 242, 255, 0.08);
                border-color: rgba(0, 242, 255, 0.12);
                box-shadow: 0 0 12px rgba(0, 242, 255, 0.06);
            }

            /* ═══════════════════════════════════════════════════════════════
               CONTENT AREA
               ═══════════════════════════════════════════════════════════════ */
            .monolith-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tab-content {
                display: none;
                flex-direction: column;
                gap: 16px;
            }

            .tab-content.active {
                display: flex;
            }

            /* ═══════════════════════════════════════════════════════════════
               GLASS PANELS & CARDS
               ═══════════════════════════════════════════════════════════════ */
            .glass-panel {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.3) 100%);
                border: 1px solid var(--border-light);
                border-radius: var(--radius-lg);
                padding: 16px;
                transition: all var(--transition-smooth);
            }

            .glass-panel:hover {
                border-color: var(--border-medium);
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.35) 100%);
            }

            .section-title {
                font-size: 12px;
                font-weight: 700;
                margin-bottom: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: var(--accent-cyan);
            }

            .section-subtitle {
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                color: var(--text-secondary);
            }

            .app-card {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0.4) 100%);
                border: 1px solid var(--border-light);
                border-radius: var(--radius-md);
                padding: 14px;
                transition: all var(--transition-smooth);
            }

            .app-card:hover {
                border-color: rgba(0, 242, 255, 0.2);
                background: linear-gradient(145deg, rgba(0, 242, 255, 0.03) 0%, rgba(0, 0, 0, 0.45) 100%);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
            }

            /* ═══════════════════════════════════════════════════════════════
               BUTTONS
               ═══════════════════════════════════════════════════════════════ */
            .btn {
                padding: 10px 16px;
                border-radius: var(--radius-md);
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                cursor: pointer;
                transition: all var(--transition-fast);
                border: 1px solid transparent;
                outline: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .btn-primary {
                background: rgba(0, 242, 255, 0.12);
                color: var(--accent-cyan);
                border-color: rgba(0, 242, 255, 0.2);
            }

            .btn-primary:hover {
                background: var(--accent-cyan);
                color: black;
                box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
            }

            .btn-secondary {
                background: rgba(255, 255, 255, 0.05);
                color: var(--text-secondary);
                border-color: var(--border-light);
            }

            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
                border-color: var(--border-medium);
            }

            .btn-danger {
                background: rgba(239, 68, 68, 0.12);
                color: var(--accent-red);
                border-color: rgba(239, 68, 68, 0.2);
            }

            .btn-danger:hover {
                background: var(--accent-red);
                color: white;
            }

            /* ═══════════════════════════════════════════════════════════════
               PERMISSION BADGES
               ═══════════════════════════════════════════════════════════════ */
            .permission-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: var(--radius-sm);
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.3px;
                text-transform: uppercase;
                background: rgba(0, 242, 255, 0.1);
                color: var(--accent-cyan);
                border: 1px solid rgba(0, 242, 255, 0.2);
            }

            .permission-badge.restricted {
                background: rgba(239, 68, 68, 0.1);
                color: var(--accent-red);
                border-color: rgba(239, 68, 68, 0.2);
            }

            /* ═══════════════════════════════════════════════════════════════
               ACCORDION
               ═══════════════════════════════════════════════════════════════ */
            .accordion-item {
                transition: all var(--transition-smooth);
                overflow: hidden;
                border: 1px solid var(--border-light);
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0.3) 100%);
                border-radius: var(--radius-lg);
                margin-bottom: 8px;
            }

            .accordion-item.expanded {
                background: linear-gradient(145deg, rgba(0, 242, 255, 0.04) 0%, rgba(0, 0, 0, 0.45) 100%);
                border-color: rgba(0, 242, 255, 0.18);
                box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.6);
                transform: scale(1.01);
                margin: 10px 0;
            }

            .accordion-trigger {
                width: 100%;
                padding: 12px 16px;
                background: transparent;
                border: none;
                color: var(--text-primary);
                font-size: 13px;
                font-weight: 600;
                text-align: left;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all var(--transition-fast);
            }

            .accordion-trigger:hover {
                color: var(--accent-cyan);
            }

            .accordion-content {
                padding: 0 16px 16px;
                color: var(--text-secondary);
                font-size: 12px;
                line-height: 1.6;
                display: none;
            }

            /* ═══════════════════════════════════════════════════════════════
               FORM ELEMENTS
               ═══════════════════════════════════════════════════════════════ */
            input[type="text"],
            input[type="email"],
            textarea,
            select {
                width: 100%;
                padding: 10px 12px;
                border-radius: var(--radius-md);
                border: 1px solid var(--border-medium);
                background: rgba(255, 255, 255, 0.03);
                color: var(--text-primary);
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                transition: all var(--transition-fast);
                outline: none;
            }

            input:focus,
            textarea:focus,
            select:focus {
                background: rgba(255, 255, 255, 0.06);
                border-color: var(--accent-cyan);
                box-shadow: 0 0 12px rgba(0, 242, 255, 0.1);
            }

            textarea {
                resize: vertical;
                min-height: 100px;
            }

            /* ═══════════════════════════════════════════════════════════════
               RUNTIME LAYER (SANDBOX)
               ═══════════════════════════════════════════════════════════════ */
            .runtime-layer {
                position: fixed;
                inset: 0;
                background: #050505;
                transform: translateY(100%);
                transition: 0.6s cubic-bezier(0.19, 1, 0.22, 1);
                z-index: 10000;
                display: flex;
                flex-direction: column;
            }

            .runtime-layer.visible {
                transform: translateY(0);
            }

            .runtime-header {
                padding: 16px 20px;
                background: rgba(0, 0, 0, 0.8);
                border-bottom: 1px solid var(--border-light);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .runtime-frame {
                flex: 1;
                width: 100%;
                border: none;
                background: white;
            }

            /* ═══════════════════════════════════════════════════════════════
               FUSION EXIT BUTTON
               ═══════════════════════════════════════════════════════════════ */
            .fusion-exit-ctrl {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10020;
            }

            .fusion-exit-btn {
                width: 40px;
                height: 40px;
                padding: 0;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 800;
                color: var(--accent-cyan);
                background: rgba(0, 0, 0, 0.45);
                border: 1px solid rgba(220, 38, 38, 0.22);
                box-shadow: 0 8px 20px rgba(220, 38, 38, 0.08);
                transition: transform 0.16s ease, background 0.16s ease, color 0.16s ease;
                cursor: pointer;
            }

            .fusion-exit-btn:hover {
                transform: scale(1.06);
                background: rgba(220, 38, 38, 0.10);
                color: #fff;
            }

            /* ═══════════════════════════════════════════════════════════════
               STATS GRID
               ═══════════════════════════════════════════════════════════════ */
            .stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                font-size: 11px;
            }

            .stat-item {
                padding: 12px;
                background: rgba(0, 242, 255, 0.05);
                border: 1px solid rgba(0, 242, 255, 0.1);
                border-radius: var(--radius-md);
            }

            .stat-label {
                color: var(--text-muted);
                margin-bottom: 4px;
            }

            .stat-value {
                color: var(--accent-cyan);
                font-size: 18px;
                font-weight: 700;
            }

            /* ═══════════════════════════════════════════════════════════════
               UTILITIES
               ═══════════════════════════════════════════════════════════════ */
            .hidden {
                display: none !important;
            }

            .flex-row {
                display: flex;
                gap: 8px;
            }

            .flex-col {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .text-center {
                text-align: center;
            }

            .text-muted {
                color: var(--text-muted);
            }

            .text-accent {
                color: var(--accent-cyan);
            }

            .mt-4 { margin-top: 16px; }
            .mb-4 { margin-bottom: 16px; }
            .gap-4 { gap: 16px; }

            /* ═══════════════════════════════════════════════════════════════
               RESPONSIVE
               ═══════════════════════════════════════════════════════════════ */
            @media (max-width: 768px) {
                .monolith {
                    width: 95%;
                    max-height: 80vh;
                }

                .monolith-content {
                    padding: 16px;
                }

                .tab-btn {
                    width: 40px;
                    height: 40px;
                }

                .btn {
                    font-size: 11px;
                    padding: 8px 12px;
                }
            }

            @media (max-width: 480px) {
                .monolith {
                    width: 98%;
                    height: 85vh;
                    border-radius: var(--radius-lg);
                }

                .monolith-header {
                    padding: 16px;
                }

                .monolith-content {
                    padding: 12px;
                    gap: 12px;
                }

                .tab-nav {
                    gap: 4px;
                }

                .tab-btn {
                    width: 36px;
                    height: 36px;
                }
            }
        `,

        build: () => {
            // Safety checks
            if (!document.getElementById(CONFIG.fusionLayerId)) {
                const nav = document.createElement('div');
                nav.id = CONFIG.fusionLayerId;
                document.body.appendChild(nav);
            }

            const existing = document.getElementById(CONFIG.rootId);
            if (existing) existing.remove();

            // Main container
            const root = document.createElement('div');
            root.id = CONFIG.rootId;
            root.innerHTML = `
                <style>${UI.styles}</style>

                <!-- Orb Trigger -->
                <button class="orb-trigger" id="${CONFIG.orbTriggerId}" title="Abrir Fusion OS">
                    <div class="orb-ring"></div>
                    <div class="orb-core"></div>
                </button>

                <!-- Fusion Exit Control -->
                <div id="${CONFIG.fusionExitBtnId}" class="fusion-exit-ctrl hidden">
                    <button class="fusion-exit-btn" onclick="FusionOS.exitFusion()" title="Sair da Fusão">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Monolith Container -->
                <div class="monolith-wrapper">
                    <div class="monolith" id="${CONFIG.monolithId}">
                        <!-- Header with Tab Navigation -->
                        <div class="monolith-header">
                            <div>
                                <h1 class="monolith-title">
                                    Fusion<span class="monolith-title-accent">OS</span>
                                </h1>
                            </div>
                            <ul class="tab-nav" id="tabNav">
                                <li>
                                    <button class="tab-btn active" data-tab="dashboard" title="Dashboard">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="3" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="14" width="7" height="7"></rect>
                                            <rect x="3" y="14" width="7" height="7"></rect>
                                        </svg>
                                    </button>
                                </li>
                                <li>
                                    <button class="tab-btn" data-tab="settings" title="Configurações">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <path d="M12 1v6m0 6v6"></path>
                                            <path d="M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24"></path>
                                            <path d="M1 12h6m6 0h6"></path>
                                            <path d="M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                                        </svg>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <!-- Content Area -->
                        <div class="monolith-content" id="monolithContent">
                            <!-- Dashboard Tab -->
                            <div id="dashboard-tab" class="tab-content active">
                                <!-- Welcome Section -->
                                <div class="glass-panel">
                                    <h2 class="section-title">👋 Bem-vindo ao Fusion OS v3.0</h2>
                                    <p style="color: var(--text-secondary); font-size: 12px; line-height: 1.6;">
                                        Sistema modular de integração com permissões avançadas, fusões inteligentes e interface refinada baseada no design do LivroVivo.
                                    </p>
                                </div>

                                <!-- System Status -->
                                <div class="glass-panel">
                                    <h3 class="section-title">📊 Status do Sistema</h3>
                                    <div class="stats-grid">
                                        <div class="stat-item">
                                            <div class="stat-label">Apps Instalados</div>
                                            <div class="stat-value" id="stat-apps">${state.apps.length}</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-label">Fusões Ativas</div>
                                            <div class="stat-value" id="stat-fusions">0</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-label">Uptime</div>
                                            <div class="stat-value" id="stat-uptime">24h</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-label">Status</div>
                                            <div class="stat-value" style="font-size: 14px;">✓ Online</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Applications Section -->
                                <div class="glass-panel">
                                    <h3 class="section-title">🚀 Aplicativos</h3>
                                    <div id="appsList" class="flex-col"></div>
                                </div>
                            </div>

                            <!-- Settings Tab -->
                            <div id="settings-tab" class="tab-content">
                                <!-- Lab Section -->
                                <div class="glass-panel">
                                    <h3 class="section-title">🔬 Laboratório</h3>
                                    
                                    <!-- HTML Converter -->
                                    <div class="accordion-item">
                                        <button class="accordion-trigger" onclick="FusionOS.toggleAccordion(this)">
                                            <span>Conversor de HTML</span>
                                            <span style="transition: transform 0.3s ease;">▼</span>
                                        </button>
                                        <div class="accordion-content">
                                            <p style="margin-bottom: 12px; font-size: 11px;">Cole HTML abaixo para processar:</p>
                                            <textarea id="lab-input" placeholder="<html>..." style="min-height: 80px; margin-bottom: 8px;"></textarea>
                                            <textarea id="lab-output" readonly placeholder="Saída processada..." style="min-height: 80px; margin-bottom: 8px;"></textarea>
                                            <div class="flex-row">
                                                <button class="btn btn-primary" onclick="FusionOS.convertHTML()">Converter</button>
                                                <button class="btn btn-secondary" onclick="FusionOS.injectModule()">Injetar</button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Custom CSS -->
                                    <div class="accordion-item">
                                        <button class="accordion-trigger" onclick="FusionOS.toggleAccordion(this)">
                                            <span>Estilos Personalizados</span>
                                            <span style="transition: transform 0.3s ease;">▼</span>
                                        </button>
                                        <div class="accordion-content">
                                            <p style="margin-bottom: 12px; font-size: 11px;">CSS customizado para o Fusion OS:</p>
                                            <textarea id="css-input" placeholder="/* Seu CSS aqui */" style="min-height: 100px; margin-bottom: 8px;">${state.customCSS}</textarea>
                                            <button class="btn btn-primary" onclick="FusionOS.saveCustomCSS()">Salvar CSS</button>
                                        </div>
                                    </div>
                                </div>

                                <!-- User Settings -->
                                <div class="glass-panel">
                                    <h3 class="section-title">⚙️ Configurações</h3>
                                    
                                    <!-- User Profile -->
                                    <div class="accordion-item">
                                        <button class="accordion-trigger" onclick="FusionOS.toggleAccordion(this)">
                                            <span>Perfil do Usuário</span>
                                            <span style="transition: transform 0.3s ease;">▼</span>
                                        </button>
                                        <div class="accordion-content">
                                            <div class="flex-col">
                                                <div>
                                                    <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Nome</label>
                                                    <input type="text" id="user-name" value="${state.userData.user}" placeholder="Seu nome" />
                                                </div>
                                                <div>
                                                    <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Sistema</label>
                                                    <input type="text" id="user-system" value="${state.userData.system}" placeholder="Nome do sistema" />
                                                </div>
                                                <button class="btn btn-primary" onclick="FusionOS.saveUserProfile()">Salvar Perfil</button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- System Actions -->
                                    <div class="accordion-item">
                                        <button class="accordion-trigger" onclick="FusionOS.toggleAccordion(this)">
                                            <span>Ações do Sistema</span>
                                            <span style="transition: transform 0.3s ease;">▼</span>
                                        </button>
                                        <div class="accordion-content">
                                            <div class="flex-col">
                                                <button class="btn btn-secondary" onclick="FusionOS.exportData()">Exportar Dados</button>
                                                <button class="btn btn-secondary" onclick="FusionOS.importData()">Importar Dados</button>
                                                <button class="btn btn-danger" onclick="FusionOS.resetSystem()">Resetar Sistema</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- About Section -->
                                <div class="glass-panel">
                                    <h3 class="section-title">ℹ️ Sobre</h3>
                                    <p style="color: var(--text-secondary); font-size: 11px; line-height: 1.6; margin-bottom: 8px;">
                                        <strong>Fusion OS v3.0 - LivroVivo Edition</strong><br/>
                                        Sistema operacional modular para integração de aplicativos web.
                                    </p>
                                    <p style="color: var(--text-muted); font-size: 10px;">
                                        Desenvolvido com ❤️ usando arquitetura IIFE e glassmorphism design.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Runtime Layer (Sandbox) -->
                <div id="${CONFIG.runtimeLayerId}" class="runtime-layer">
                    <div class="runtime-header">
                        <span style="font-size: 12px; font-weight: 700; color: var(--accent-cyan);">SANDBOX MODE</span>
                        <button class="btn btn-secondary" onclick="FusionOS.closeRuntime()" style="padding: 6px 12px;">Fechar</button>
                    </div>
                    <iframe id="${CONFIG.runtimeFrameId}" class="runtime-frame"></iframe>
                </div>
            `;

            document.body.appendChild(root);
        },

        injectCustomCSS: (css) => {
            const cssRoot = document.getElementById(CONFIG.customCssRootId);
            if (cssRoot) {
                cssRoot.innerHTML = `<style>${css}</style>`;
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 6. TAB SWITCHING
    // ═══════════════════════════════════════════════════════════════════════
    const switchTab = (tabName) => {
        // Update state
        state.currentTab = tabName;

        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Mark button as active
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 7. APP RENDERING
    // ═══════════════════════════════════════════════════════════════════════
    const renderApps = () => {
        const appsList = document.getElementById('appsList');
        if (!appsList) return;

        appsList.innerHTML = state.apps
            .filter(app => !state.hiddenApps.includes(app.id))
            .map(app => `
                <div class="app-card">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <h3 style="font-size: 13px; font-weight: 700; margin-bottom: 4px; color: var(--text-primary);">
                                ${app.name}
                            </h3>
                            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
                                ${app.desc}
                            </p>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                ${(app.permissions || []).map(perm => `
                                    <span class="permission-badge ${perm === 'ADMIN' ? 'restricted' : ''}">
                                        ${perm}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        <button class="btn btn-primary" onclick="FusionOS.launch('${app.id}', 'sandbox')" style="flex: 1;">
                            Janela
                        </button>
                        <button class="btn btn-secondary" onclick="FusionOS.launch('${app.id}', 'fusion')" style="flex: 1;">
                            Fusão
                        </button>
                    </div>
                </div>
            `).join('');
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 8. DOM INJECTION HELPERS
    // ═══════════════════════════════════════════════════════════════════════
    const injectIntoDOM = async (target, html) => {
        target.innerHTML = "";

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // CSS first
        doc.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
            document.head.appendChild(el.cloneNode(true));
        });

        // Body
        const body = document.createElement('div');
        body.innerHTML = doc.body.innerHTML;
        target.appendChild(body);

        // Scripts - guaranteed order
        for (const old of body.querySelectorAll('script')) {
            const s = document.createElement('script');
            [...old.attributes].forEach(a => s.setAttribute(a.name, a.value));

            if (old.src) {
                s.src = old.src;
                s.async = false;
                await new Promise(res => {
                    s.onload = res;
                    s.onerror = res;
                });
            } else {
                s.textContent = old.textContent;
            }

            old.replaceWith(s);
        }
    };

    const createIframe = (target, url) => {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.cssText = "width:100vw; height:100vh; border:none; position:fixed; inset:0; z-index:10015; background:black;";
        target.appendChild(iframe);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 9. PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════
    const toggle = () => {
        const monolith = document.getElementById(CONFIG.monolithId);
        state.active = !state.active;

        if (state.active) {
            document.body.classList.add('os-active');
            monolith.style.pointerEvents = 'auto';
        } else {
            document.body.classList.remove('os-active');
            monolith.style.pointerEvents = 'none';
        }
    };

    const launch = (appId, mode) => {
        const app = state.apps.find(a => a.id === appId);
        if (!app) {
            Utils.speak('Aplicativo não encontrado.');
            return;
        }

        if (mode === 'sandbox') {
            const runtimeLayer = document.getElementById(CONFIG.runtimeLayerId);
            const runtimeFrame = document.getElementById(CONFIG.runtimeFrameId);
            runtimeLayer.classList.add('visible');
            runtimeFrame.src = app.url;
            Utils.speak(`Abrindo ${app.name} em sandbox.`);
        } else if (mode === 'fusion') {
            SmartFusion.performFusion(app);
        }
    };

    const exitFusion = () => {
        const layer = document.getElementById(CONFIG.fusionLayerId);
        if (layer) layer.innerHTML = '';
        document.getElementById(CONFIG.fusionExitBtnId).classList.add('hidden');
        Utils.speak("Fusão encerrada.");
        if (!state.active) toggle();
    };

    const closeRuntime = () => {
        const rt = document.getElementById(CONFIG.runtimeLayerId);
        if (!rt) return;
        rt.classList.remove('visible');
        setTimeout(() => {
            const frame = document.getElementById(CONFIG.runtimeFrameId);
            if (frame) frame.src = '';
        }, 500);
    };

    const toggleAccordion = (trigger) => {
        const item = trigger.parentElement;
        const content = item.querySelector('.accordion-content');
        const isOpen = content.style.display !== 'none';

        item.classList.toggle('expanded');
        content.style.display = isOpen ? 'none' : 'block';

        const icon = trigger.querySelector('span:last-child');
        icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    };

    const convertHTML = () => {
        const input = document.getElementById('lab-input').value;
        const output = document.getElementById('lab-output');

        if (!input.trim()) {
            output.value = '/* Nenhuma entrada */';
            return;
        }

        const processed = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .trim();

        output.value = `/* HTML Processado */\n${processed.substring(0, 500)}...`;
        Utils.speak('HTML convertido com sucesso.');
    };

    const injectModule = () => {
        const code = document.getElementById('lab-output').value;
        if (!code.trim()) {
            Utils.speak('Nenhum código para injetar.');
            return;
        }

        try {
            eval(code);
            Utils.speak('Módulo injetado com sucesso.');
        } catch (e) {
            console.error('Erro ao injetar módulo:', e);
            Utils.speak('Erro ao injetar módulo.');
            Utils.shake();
        }
    };

    const saveCustomCSS = () => {
        const css = document.getElementById('css-input').value;
        state.customCSS = css;
        UI.injectCustomCSS(css);
        Utils.save();
        Utils.speak('Estilos personalizados salvos.');
    };

    const saveUserProfile = () => {
        const userName = document.getElementById('user-name').value;
        const userSystem = document.getElementById('user-system').value;
        
        state.userData.user = userName;
        state.userData.system = userSystem;
        Utils.save();
        Utils.speak('Perfil atualizado.');
    };

    const exportData = () => {
        const data = JSON.stringify({
            apps: state.apps,
            hiddenApps: state.hiddenApps,
            customCSS: state.customCSS,
            userData: state.userData
        }, null, 2);

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fusion-os-backup.json';
        a.click();
        URL.revokeObjectURL(url);
        Utils.speak('Dados exportados.');
    };

    const importData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    state.apps = data.apps || state.apps;
                    state.hiddenApps = data.hiddenApps || state.hiddenApps;
                    state.customCSS = data.customCSS || state.customCSS;
                    state.userData = data.userData || state.userData;
                    Utils.save();
                    renderApps();
                    Utils.speak('Dados importados com sucesso.');
                } catch (err) {
                    console.error('Erro ao importar:', err);
                    Utils.speak('Erro ao importar dados.');
                    Utils.shake();
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const resetSystem = () => {
        if (!confirm('Tem certeza que deseja resetar o sistema? Todos os dados serão perdidos.')) {
            return;
        }

        localStorage.removeItem(CONFIG.storageKey);
        state.apps = [...DEFAULT_APPS];
        state.hiddenApps = [];
        state.customCSS = '';
        state.userData = { 
            user: 'Visitante', 
            system: 'SINGULARITY', 
            stats: {
                appsInstalled: 3,
                fusionsActive: 0,
                uptime: '24h'
            }
        };
        Utils.save();
        renderApps();
        Utils.speak('Sistema resetado.');
    };

    const init = () => {
        Utils.load();
        Utils.injectDeps();
        UI.build();
        renderApps();

        // Event Listeners
        document.getElementById(CONFIG.orbTriggerId).addEventListener('click', toggle);

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                switchTab(tab);
            });
        });

        // Inject custom CSS if exists
        if (state.customCSS) {
            UI.injectCustomCSS(state.customCSS);
        }

        Utils.speak('Fusion OS inicializado.');
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 10. AUTO-INIT & RETURN PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        toggle,
        launch,
        exitFusion,
        closeRuntime,
        switchTab,
        toggleAccordion,
        convertHTML,
        injectModule,
        saveCustomCSS,
        saveUserProfile,
        exportData,
        importData,
        resetSystem,
        Permissions,
        SmartFusion,
        Utils,
        state
    };
})();
