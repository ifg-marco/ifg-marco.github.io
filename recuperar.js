// Arquivo independente do bundle do aplicativo: mantém o download disponível se a UI falhar.
(async function () {
  const status = document.getElementById('estado');
  const list = document.getElementById('copias');
  const open = () => new Promise((resolve, reject) => {
    const request = indexedDB.open('libras-backups');
    // Consultar a página antes do primeiro backup não pode criar um banco v1 vazio:
    // o aplicativo precisa abrir esse banco do zero para criar suas stores.
    request.onupgradeneeded = (event) => {
      if (event.oldVersion === 0) request.transaction.abort();
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Feche outras abas do aplicativo e tente novamente.'));
  });
  const read = (request) => new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const hash = async (value) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return [...new Uint8Array(digest)].map((part) => part.toString(16).padStart(2, '0')).join('');
  };
  const reasons = {
    initial: 'Primeira cópia', weekly: 'Cópia semanal', 'pre-update': 'Antes da atualização',
    'pre-migration': 'Antes da migração', manual: 'Cópia manual', rollback: 'Ponto de retorno'
  };
  try {
    const db = await open();
    if (!db.objectStoreNames.contains('snapshots')) {
      status.textContent = 'Nenhuma cópia automática foi encontrada neste navegador.';
      db.close();
      return;
    }
    const records = await read(db.transaction('snapshots', 'readonly').objectStore('snapshots').getAll());
    db.close();
    const valid = [];
    for (const record of records.filter((item) => item && item.confirmed && typeof item.createdAt === 'string')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
      try {
        if (record.schemaVersion !== 1 || typeof record.id !== 'string' || !record.id ||
            typeof record.appVersion !== 'string' || !record.appVersion ||
            !Number.isFinite(Date.parse(record.createdAt)) || typeof record.payload !== 'string' ||
            !Object.prototype.hasOwnProperty.call(reasons, record.reason) || !Number.isInteger(record.bytes) ||
            record.bytes < 0 || record.bytes > 32 * 1024 * 1024 ||
            new TextEncoder().encode(record.payload).byteLength !== record.bytes || await hash(record.payload) !== record.sha256)
          continue;
        const data = JSON.parse(record.payload);
        if (data.kind !== 'libras-local-snapshot' || data.schemaVersion !== 1 || !data.local || !data.stores ||
            !Array.isArray(data.stores.cardProgress) || !Array.isArray(data.stores.notebooks) || !Array.isArray(data.stores.cards)) continue;
        valid.push(record);
      } catch { /* cópia corrompida não deve impedir acesso às demais */ }
    }
    status.textContent = valid.length ? `${valid.length} ${valid.length === 1 ? 'cópia válida encontrada' : 'cópias válidas encontradas'}.` :
      'Nenhuma cópia válida encontrada. Procure um arquivo de backup que você já tenha baixado.';
    for (const record of valid) {
      const item = document.createElement('li');
      const description = document.createElement('span');
      description.textContent = `${new Date(record.createdAt).toLocaleString('pt-BR')} · ${reasons[record.reason]} · app ${record.appVersion} · formato ${record.schemaVersion} · ${(record.bytes / 1024 / 1024).toFixed(1)} MB · integridade verificada `;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Baixar esta cópia';
      button.addEventListener('click', () => {
        const url = URL.createObjectURL(new Blob([JSON.stringify(record)], { type: 'application/json' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `libras-snapshot-${record.createdAt.slice(0, 10)}-${record.id.slice(0, 8)}.json`;
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      });
      item.append(description, button);
      list.append(item);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      status.textContent = 'Nenhuma cópia automática foi encontrada neste navegador.';
    } else {
      status.className = 'erro';
      status.textContent = 'Não foi possível ler as cópias deste navegador. Guarde qualquer arquivo de backup que você já tenha baixado. ' +
        (error instanceof Error ? error.message : '');
    }
  }
})();
