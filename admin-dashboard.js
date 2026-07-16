// admin-dashboard.js
// Script espião para o CMS Visual Headless

(function() {
  'use strict';

  let isAdminActive = false;
  let adminPassword = '';

  // Atalho: Ctrl + Shift + Alt + M
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.altKey && e.code === 'KeyM') {
      e.preventDefault();
      toggleAdmin();
    }
  });

  function toggleAdmin() {
    if (isAdminActive) {
      disableAdmin();
    } else {
      if (!adminPassword) {
        const pass = prompt('Digite a senha de administrador (ADMIN_SECRET):');
        if (!pass) return; // Cancelou
        adminPassword = pass;
      }
      enableAdmin();
    }
  }

  function enableAdmin() {
    isAdminActive = true;

    // Injeta o painel admin
    const panel = document.createElement('div');
    panel.id = 'headless-admin-panel';
    panel.style.position = 'fixed';
    panel.style.bottom = '20px';
    panel.style.right = '20px';
    panel.style.background = '#030712';
    panel.style.border = '2px solid #3b82f6';
    panel.style.borderRadius = '12px';
    panel.style.padding = '16px';
    panel.style.zIndex = '999999';
    panel.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    panel.style.color = '#fff';
    panel.style.fontFamily = 'sans-serif';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.gap = '12px';
    panel.style.width = '300px';

    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; padding-bottom: 8px;">
        <strong style="color: #3b82f6;">⚡ Visual CMS Ativo</strong>
        <button id="close-admin-btn" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:bold;">X</button>
      </div>
      <p style="font-size: 13px; color: #9ca3af; margin: 0;">Você pode clicar nos textos da página para editá-los diretamente.</p>
      
      <!-- Edição de imagens -->
      <div style="font-size: 13px; border: 1px dashed #374151; padding: 8px; border-radius: 8px;">
        <label style="display:block;margin-bottom:4px;color:#d1d5db;">Trocar Imagem (clique na imagem antes):</label>
        <input type="text" id="admin-img-url" placeholder="Nova URL da imagem..." style="width:100%; padding:6px; border-radius:4px; border:1px solid #374151; background:#1f2937; color:#fff; font-size:12px; margin-bottom: 6px;">
        <button id="admin-img-apply" style="width:100%; padding:6px; background:#4b5563; border:none; color:white; border-radius:4px; cursor:pointer;">Aplicar Nova Imagem</button>
      </div>

      <button id="admin-save-btn" style="width: 100%; background: #2563eb; color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;">
        💾 Salvar Alterações
      </button>
    `;

    document.body.appendChild(panel);

    document.getElementById('close-admin-btn').addEventListener('click', disableAdmin);
    document.getElementById('admin-save-btn').addEventListener('click', saveChanges);

    // Selecionar imagens para edição
    let selectedImage = null;
    document.addEventListener('click', imageSelectorListener);

    function imageSelectorListener(e) {
      if (!isAdminActive) return;
      if (e.target.tagName === 'IMG' && !panel.contains(e.target)) {
        e.preventDefault();
        if (selectedImage) selectedImage.style.outline = 'none';
        selectedImage = e.target;
        selectedImage.style.outline = '3px solid #f59e0b'; // Outline laranja
        document.getElementById('admin-img-url').value = selectedImage.src;
      }
    }
    
    // Armazena a função no window para poder remover depois
    window.__adminImageSelector = imageSelectorListener;

    document.getElementById('admin-img-apply').addEventListener('click', () => {
      if (selectedImage) {
        selectedImage.src = document.getElementById('admin-img-url').value;
        selectedImage.style.outline = 'none';
        selectedImage = null;
        document.getElementById('admin-img-url').value = '';
      } else {
        alert('Clique em uma imagem na página primeiro!');
      }
    });

    // Ativar contenteditable em textos
    const textSelectors = 'h1, h2, h3, h4, h5, p, span, a, .service-title, .service-desc, .card-subtitle';
    document.querySelectorAll(textSelectors).forEach(el => {
      if (!panel.contains(el)) { // Não afetar o próprio painel
        el.setAttribute('contenteditable', 'true');
        el.style.outline = '1px dashed rgba(59, 130, 246, 0.5)';
      }
    });
  }

  function disableAdmin() {
    isAdminActive = false;
    const panel = document.getElementById('headless-admin-panel');
    if (panel) panel.remove();

    // Desativar contenteditable
    const textSelectors = 'h1, h2, h3, h4, h5, p, span, a, .service-title, .service-desc, .card-subtitle';
    document.querySelectorAll(textSelectors).forEach(el => {
      el.removeAttribute('contenteditable');
      el.style.outline = '';
    });

    // Remover outlines de imagens
    document.querySelectorAll('img').forEach(img => {
      img.style.outline = '';
    });

    if (window.__adminImageSelector) {
      document.removeEventListener('click', window.__adminImageSelector);
    }
  }

  async function saveChanges() {
    const btn = document.getElementById('admin-save-btn');
    btn.textContent = 'Salvando...';
    btn.disabled = true;
    btn.style.background = '#9ca3af';

    // Desativa o painel para limpar o HTML
    disableAdmin();

    // Remove scripts desnecessários caso o Live Server do VSCode tenha injetado algo
    const liveServerScripts = document.querySelectorAll('script[src*="live-server"]');
    liveServerScripts.forEach(s => s.remove());

    // Pega o HTML limpo
    const finalHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          html: finalHtml,
          password: adminPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Alterações salvas com sucesso!\nO GitHub recebeu seu código. A Vercel atualizará o site no ar em cerca de 1 minuto.');
      } else {
        throw new Error(result.error || 'Erro desconhecido ao salvar.');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Erro ao salvar: ' + error.message);
      // Reativa o painel para o usuário não perder as mudanças caso queira tentar novamente
      enableAdmin();
    }
  }

})();
