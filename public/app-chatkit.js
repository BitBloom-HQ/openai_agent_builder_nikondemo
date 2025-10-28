// public/app-chatkit.js — Variant A (Dark Minimal - Nikon Yellow)

function showUnavailable(statusEl, statusTextEl, note = '') {
  statusEl.style.display = 'flex';
  statusTextEl.textContent =
    'The service is unavailable at the moment, please try again later ' +
    (note ? ` (${note})` : '');
}

async function fetchClientSecret() {
  console.log('[CK] fetching client_secret...');
  const r = await fetch('/api/chatkit/session', { method: 'POST' });
  if (!r.ok) {
    let m = 'Service unavailable. Please try again later.';
    try {
      const j = await r.json();
      console.warn('[CK] session error:', j?.error?.code, j?.error?.message);
    } catch {}
    throw new Error(m);
  }
  const j = await r.json();
  if (!j?.client_secret) throw new Error('Service unavailable. Please try again later.');
  console.log('[CK] got client_secret ok');
  return j.client_secret;
}

function buildOptions() {
  return {
    theme: {
      colorScheme: 'dark',
      color: { accent: { primary: '#FFD400', level: 2 } }, // Nikon Yellow
      radius: 'round',
      density: 'compact',
      typography: { fontFamily: "'Inter', system-ui, sans-serif" },
    },
    composer: {
      placeholder: 'Ask about the Nikon D700…',
    },
    startScreen: {
      greeting: 'What can I help you with?',
    },
    history: { enabled: true },
    locale: 'en-US',
  };
}

async function mountChat(root) {
  const status = document.getElementById('chat-status');
  const statusText = document.getElementById('chat-status-text');
  const container = document.getElementById('chat-container');

  container.style.display = 'block';
  status.style.display = 'flex';
  statusText.textContent = 'Connecting to agent…';

  try {
    await (customElements.get('openai-chatkit')
      ? Promise.resolve()
      : customElements.whenDefined('openai-chatkit'));

    // create element
    const el = document.createElement('openai-chatkit');

    // conceal status when ready
    el.addEventListener('chatkit.ready', () => {
      status.style.display = 'none';
    });

    // attach to DOM
    root.innerHTML = '';
    root.appendChild(el);

    // settings
    el.setOptions({
      api: {
        async getClientSecret() {
          try {
            return await fetchClientSecret();
          } catch (err) {
            console.warn('[CK] getClientSecret failed:', err?.message);
            showUnavailable(status, statusText);
            throw err;
          }
        },
      },
      ...buildOptions(),
    });

    // event logging
    el.addEventListener('chatkit.message.sent', (e) => {
      console.log('[CK] message.sent', e?.detail ?? '(no detail)');
    });
  } catch (e) {
    console.error('[CK] mount error:', e);
    showUnavailable(status, statusText);
  }
}
window.__mountChat = mountChat;

(function wire() {
  const chatRoot = document.getElementById('my-chat');
  document.querySelectorAll('.open-chat').forEach((btn) => {
    if (btn.dataset.chatWired) return;
    btn.dataset.chatWired = '1';
    btn.addEventListener('click', () => {
      if (window.__opening) return;
      window.__opening = true;
      mountChat(chatRoot).finally(() => {
        window.__opening = false;
      });
    });
  });

  const close = document.getElementById('chat-close');
  if (close)
    close.addEventListener('click', () => {
      document.getElementById('chat-container').style.display = 'none';
      document.getElementById('chat-status').style.display = 'none';
      document.getElementById('chat-status-text').textContent = 'Connecting to agent…';
    });
})();
