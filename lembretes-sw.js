// Parte do Service Worker que cuida dos lembretes de estudo (importada pelo Workbox: ver vite.config.ts).
// O app grava em IndexedDB ("libras-lembretes") a próxima janela e a mensagem já escolhida com o
// estado local do estudante; aqui só se decide se já é hora e se mostra a notificação. Nada sai do aparelho.
const BANCO = 'libras-lembretes';
const LOJA = 'estado';

function abrir() {
  return new Promise((resolver, rejeitar) => {
    const pedido = indexedDB.open(BANCO, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(LOJA);
    pedido.onsuccess = () => resolver(pedido.result);
    pedido.onerror = () => rejeitar(pedido.error);
  });
}
async function ler() {
  const banco = await abrir();
  return new Promise((resolver) => {
    const pedido = banco.transaction(LOJA).objectStore(LOJA).get('proximo');
    pedido.onsuccess = () => { banco.close(); resolver(pedido.result); };
    pedido.onerror = () => { banco.close(); resolver(undefined); };
  });
}
async function gravar(valor) {
  const banco = await abrir();
  return new Promise((resolver) => {
    const transacao = banco.transaction(LOJA, 'readwrite');
    transacao.objectStore(LOJA).put(valor, 'proximo');
    transacao.oncomplete = () => { banco.close(); resolver(); };
    transacao.onerror = () => { banco.close(); resolver(); };
  });
}

async function avisarSeForHora() {
  const estado = await ler();
  if (!estado || !estado.ativo || !estado.campanha || Notification.permission !== 'granted') return;
  if (Date.now() < estado.apartirDe) return;
  // Com o app aberto e visível a própria tela já mostra o que falta: a notificação seria ruído.
  const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (janelas.some((janela) => janela.visibilityState === 'visible')) return;
  await self.registration.showNotification(estado.campanha.titulo, {
    body: estado.campanha.corpo,
    icon: estado.icone,
    badge: estado.icone,
    lang: 'pt-BR',
    tag: 'libras-lembrete',
    data: { url: estado.destino }
  });
  // Uma notificação por janela: o app recalcula a próxima na abertura seguinte.
  await gravar({ ...estado, ativo: false, enviadoEm: Date.now() });
}

self.addEventListener('periodicsync', (evento) => {
  if (evento.tag === 'libras-lembrete') evento.waitUntil(avisarSeForHora());
});

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const destino = (evento.notification.data && evento.notification.data.url) || self.registration.scope;
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      const aberta = janelas.find((janela) => 'focus' in janela);
      if (aberta) return aberta.navigate(destino).then((j) => (j || aberta).focus());
      return self.clients.openWindow(destino);
    })
  );
});

// Push do servidor (FCM): sempre mostra uma notificação (o navegador exige). O texto vem, na ordem,
// do próprio envio (mensagem de teste do Console), da mensagem já calculada com o estudo local
// ou de um convite genérico. Dados de estudo nunca precisam viajar pela rede.
self.addEventListener('push', (evento) => {
  evento.waitUntil((async () => {
    let carga = {};
    try { carga = evento.data ? evento.data.json() : {}; } catch (e) { carga = {}; }
    const enviada = carga.notification || carga.data || {};
    const estado = await ler();
    const local = estado && estado.campanha;
    const titulo = enviada.title || enviada.titulo || (local && local.titulo) || 'Caderno de Libras';
    const corpo = enviada.body || enviada.corpo || (local && local.corpo) || 'Que tal uma rodada curta hoje, no seu ritmo?';
    await self.registration.showNotification(titulo, {
      body: corpo,
      icon: estado && estado.icone,
      badge: estado && estado.icone,
      lang: 'pt-BR',
      tag: 'libras-lembrete',
      data: { url: (estado && estado.destino) || self.registration.scope }
    });
  })());
});
