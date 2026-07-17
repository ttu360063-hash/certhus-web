// ===================================================
// CERTHUS PORTIFOLIO — Admin Dashboard JS
// ===================================================

(function() {
  'use strict';

  var _adminSecret = '';

  // --- ATALHO DE TECLADO ---
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.altKey && (e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      showLoginModal();
    }
  });

  // CSS dinâmico para o Dashboard
  var style = document.createElement('style');
  style.innerHTML = `
    #certhus-admin-panel {
      position: fixed; inset: 0; z-index: 100000;
      background: #0f1115; color: #fff;
      font-family: 'Inter', sans-serif;
      display: flex; flex-direction: row;
      overflow: hidden;
    }
    .cadmin-sidebar {
      width: 260px; background: #181b21; border-right: 1px solid #282c34;
      display: flex; flex-direction: column;
    }
    .cadmin-brand {
      padding: 24px; border-bottom: 1px solid #282c34;
      font-weight: 800; font-size: 18px; color: #60a5fa;
    }
    .cadmin-nav {
      flex: 1; padding: 24px 12px; overflow-y: auto;
    }
    .cadmin-nav-item {
      padding: 12px 16px; margin-bottom: 8px; border-radius: 8px;
      cursor: pointer; font-size: 14px; font-weight: 500; color: #a0aabf;
      transition: all 0.2s;
    }
    .cadmin-nav-item:hover { background: #282c34; color: #fff; }
    .cadmin-nav-item.active { background: #2563eb; color: #fff; }
    .cadmin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .cadmin-header {
      height: 70px; border-bottom: 1px solid #282c34; background: #181b21;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 32px;
    }
    .cadmin-content { flex: 1; padding: 32px; overflow-y: auto; background: #0f1115; }
    .cadmin-form-group { margin-bottom: 24px; }
    .cadmin-label { display: block; font-size: 13px; color: #a0aabf; margin-bottom: 8px; font-weight: 600; }
    .cadmin-input, .cadmin-textarea {
      width: 100%; padding: 12px 16px; border-radius: 8px;
      background: #1e222b; border: 1px solid #282c34; color: #fff;
      font-family: 'Inter', sans-serif; font-size: 14px; outline: none;
    }
    .cadmin-textarea { resize: vertical; min-height: 100px; }
    .cadmin-btn {
      padding: 12px 24px; border-radius: 8px; background: #2563eb; color: #fff;
      font-weight: 600; border: none; cursor: pointer; font-size: 14px;
      transition: background 0.2s;
    }
    .cadmin-btn:hover { background: #1d4ed8; }
    .cadmin-btn-outline {
      padding: 12px 24px; border-radius: 8px; background: transparent; color: #60a5fa;
      font-weight: 600; border: 1px solid #2563eb; cursor: pointer; font-size: 14px;
    }
    .cadmin-btn-outline:hover { background: rgba(37,99,235,0.1); }
    .cadmin-btn-danger { background: #ef4444; }
    .cadmin-btn-danger:hover { background: #dc2626; }
    .cadmin-project-item {
      background: #1e222b; border: 1px solid #282c34; border-radius: 8px;
      padding: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;
    }
    .cadmin-project-item-info { display: flex; flex-direction: column; gap: 4px; }
  `;
  document.head.appendChild(style);

  // --- 1. MODAL DE LOGIN ---
  function showLoginModal() {
    if (document.getElementById('admin-modal')) return;

    var modal = document.createElement('div');
    modal.id = 'admin-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:100000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(15px);';

    modal.innerHTML = '<div style="background:#181b21;padding:40px;border-radius:16px;border:1px solid #282c34;width:100%;max-width:400px;text-align:center;">'
      + '<h2 style="color:white;margin-bottom:8px;font-size:24px;">Certhus Admin</h2>'
      + '<p style="color:#a0aabf;margin-bottom:32px;font-size:14px;">Acesso restrito ao painel de controle</p>'
      + '<div style="text-align:left;margin-bottom:16px;">'
      + '<label class="cadmin-label">Usuário</label>'
      + '<input type="text" id="admin-user" class="cadmin-input" placeholder="Admin">'
      + '</div>'
      + '<div style="text-align:left;margin-bottom:16px;">'
      + '<label class="cadmin-label">Senha</label>'
      + '<input type="password" id="admin-pass" class="cadmin-input" placeholder="Senha secreta">'
      + '</div>'
      + '<button id="admin-login-btn" class="cadmin-btn" style="width:100%;margin-top:16px;">Entrar no Dashboard</button>'
      + '</div>';

    document.body.appendChild(modal);

    document.getElementById('admin-login-btn').onclick = function() {
      var u = document.getElementById('admin-user').value;
      var p = document.getElementById('admin-pass').value;
      if (u && p) { // Qualquer usuário serve, mas precisamos da senha para a API
        _adminSecret = p;
        modal.remove();
        initDashboard();
      } else {
        alert('Preencha os campos.');
      }
    };
  }

  // --- 2. INICIAR DASHBOARD ---
  function initDashboard() {
    var root = document.getElementById('root');
    if (root) root.style.display = 'none';

    var dashboard = document.createElement('div');
    dashboard.id = 'certhus-admin-panel';

    dashboard.innerHTML = '<div class="cadmin-sidebar">'
      + '<div class="cadmin-brand">Certhus Admin</div>'
      + '<div class="cadmin-nav">'
      + '<div class="cadmin-nav-item active" data-tab="hero">🏠 Início (Hero)</div>'
      + '<div class="cadmin-nav-item" data-tab="services">⚙️ Serviços</div>'
      + '<div class="cadmin-nav-item" data-tab="about">ℹ️ Sobre</div>'
      + '<div class="cadmin-nav-item" data-tab="portfolio">💼 Portfólio</div>'
      + '<div class="cadmin-nav-item" data-tab="cta">📞 Contato</div>
      <div class="cadmin-nav-item" data-tab="footer">🔻 Rodapé</div>'
      + '<div class="cadmin-nav-item" data-tab="advanced" style="margin-top:24px;border-top:1px solid #282c34;padding-top:16px;border-radius:0;">🚀 Publicar</div>'
      + '</div>'
      + '</div>'
      + '<div class="cadmin-main">'
      + '<div class="cadmin-header">'
      + '  <div style="font-size:18px;font-weight:600;">Editar Seção</div>'
      + '  <button class="cadmin-btn-outline" id="cadmin-exit">Fechar Painel</button>'
      + '</div>'
      + '<div class="cadmin-content" id="cadmin-form-container"></div>'
      + '</div>';

    document.body.appendChild(dashboard);

    document.getElementById('cadmin-exit').onclick = closeDashboard;

    var tabs = dashboard.querySelectorAll('.cadmin-nav-item');
    for (var i = 0; i < tabs.length; i++) {
      (function(tab) {
        tab.onclick = function() {
          for (var j = 0; j < tabs.length; j++) { tabs[j].classList.remove('active'); }
          tab.classList.add('active');
          renderForm(tab.getAttribute('data-tab'));
        };
      })(tabs[i]);
    }

    renderForm('hero');
  }

  function closeDashboard() {
    var dash = document.getElementById('certhus-admin-panel');
    if (dash) dash.remove();
    var root = document.getElementById('root');
    if (root) root.style.display = 'block';
  }

  // --- 3. EXTRATORES ---
  function getDOMValue(selector, type) {
    var el = document.querySelector(selector);
    if (!el) return '';
    if (type === 'html') return el.innerHTML;
    if (type === 'text') return el.innerText;
    if (type === 'href') return el.getAttribute('href') || '';
    if (type === 'src') return el.getAttribute('src') || '';
    return el.innerText;
  }

  function setDOMValue(selector, type, val) {
    var el = document.querySelector(selector);
    if (!el) return;
    if (type === 'html') el.innerHTML = val;
    else if (type === 'text') el.innerText = val;
    else if (type === 'href') el.setAttribute('href', val);
    else if (type === 'src') el.setAttribute('src', val);
  }

  // --- 4. RENDERIZADORES DE FORMULÁRIO ---
  function renderForm(tab) {
    var container = document.getElementById('cadmin-form-container');
    container.innerHTML = '';

    const createInput = (id, label, val) => '<div class="cadmin-form-group"><label class="cadmin-label">'+label+'</label><input type="text" id="'+id+'" class="cadmin-input" value="'+(val||'')+'"></div>';
    const createTextarea = (id, label, val) => '<div class="cadmin-form-group"><label class="cadmin-label">'+label+'</label><textarea id="'+id+'" class="cadmin-textarea">'+(val||'')+'</textarea></div>';

    if (tab === 'hero') {
      var html = '<h2>Início (Hero)</h2>'
        + createInput('fh-title', 'Título Principal (HTML permitido)', getDOMValue('#hero .hero-title', 'html'))
        + createTextarea('fh-desc', 'Descrição', getDOMValue('#hero .hero-desc', 'text'))
        + createInput('fh-b1t', 'Botão 1 (Esquerdo) - Texto', getDOMValue('#hero .btn-primary', 'text'))
        + createInput('fh-b2t', 'Botão 2 (Direito) - Texto', getDOMValue('#hero .btn-outline', 'text'))
        + createInput('fh-b2l', 'Botão 2 (Direito) - Link', getDOMValue('#hero .btn-outline', 'href'))
        + createInput('fh-logo-alt', 'Texto Alternativo da Logo 3D', getDOMValue('#hero-logo-float img', 'alt'))
        + '<button id="btn-save-hero" class="cadmin-btn">Salvar Alterações</button>';
      container.innerHTML = html;

      document.getElementById('btn-save-hero').onclick = function() {
        setDOMValue('#hero .hero-title', 'html', document.getElementById('fh-title').value);
        setDOMValue('#hero .hero-desc', 'text', document.getElementById('fh-desc').value);
        setDOMValue('#hero .btn-primary', 'text', document.getElementById('fh-b1t').value);
        setDOMValue('#hero-logo-float img', 'alt', document.getElementById('fh-logo-alt').value);
        
        var b2 = document.querySelector('#hero .btn-outline');
        if(b2) {
          b2.innerHTML = document.getElementById('fh-b2t').value + ' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
          b2.setAttribute('href', document.getElementById('fh-b2l').value);
        }
        alert('⚠️ ATENÇÃO: As alterações foram salvas APENAS na sua tela atual.\n\nPara enviar de verdade para o site oficial, vá na aba "🚀 Publicar" e clique em "Publicar Agora".');
      };
    }
    else if (tab === 'services') {
      container.innerHTML = '<h2>Serviços</h2><p style="color:#a0aabf;margin-bottom:24px;">Edite os 3 serviços principais.</p>'
        + '<div id="srv-list"></div><button id="btn-save-srv" class="cadmin-btn">Salvar Alterações</button>';
      var list = document.getElementById('srv-list');
      var items = document.querySelectorAll('#services-strip .service-item');
      items.forEach(function(item, idx) {
        var t = item.querySelector('.service-title').innerText;
        var d = item.querySelector('.service-desc').innerText;
        var i = item.querySelector('.service-icon').innerHTML;
        var div = document.createElement('div');
        div.className = 'cadmin-form-group';
        div.style.padding = '16px'; div.style.background = '#1e222b'; div.style.borderRadius = '8px';
        div.innerHTML = '<h4>Serviço '+(idx+1)+'</h4>'
          + '<label class="cadmin-label" style="margin-top:12px">Título</label><input type="text" id="srv-t-'+idx+'" class="cadmin-input" value="'+t+'">'
          + '<label class="cadmin-label" style="margin-top:12px">Descrição</label><textarea id="srv-d-'+idx+'" class="cadmin-textarea" style="min-height:60px">'+d+'</textarea>'
          + '<label class="cadmin-label" style="margin-top:12px">Ícone (SVG)</label><input type="text" id="srv-i-'+idx+'" class="cadmin-input" value=\''+i.replace(/'/g,"&apos;")+'\'>';
        list.appendChild(div);
      });

      document.getElementById('btn-save-srv').onclick = function() {
        items.forEach(function(item, idx) {
          item.querySelector('.service-title').innerText = document.getElementById('srv-t-'+idx).value;
          item.querySelector('.service-desc').innerText = document.getElementById('srv-d-'+idx).value;
          item.querySelector('.service-icon').innerHTML = document.getElementById('srv-i-'+idx).value;
        });
        alert('⚠️ ATENÇÃO: As alterações foram salvas APENAS na sua tela atual.\n\nPara enviar de verdade para o site oficial, vá na aba "🚀 Publicar" e clique em "Publicar Agora".');
      };
    }
    else if (tab === 'about') {
      var html = '<h2>Sobre</h2>'
        + createInput('fa-lbl', 'Rótulo Pequeno', getDOMValue('#about .about-label', 'text'))
        + createInput('fa-title', 'Título', getDOMValue('#about .about-title', 'text'))
        + createTextarea('fa-desc', 'Descrição', getDOMValue('#about .about-desc', 'text'))
        + createInput('fa-img', 'Imagem (URL)', getDOMValue('#about .about-img-wrap img', 'src'))
        + createInput('fa-img-alt', 'Texto Alternativo da Imagem', getDOMValue('#about .about-img-wrap img', 'alt'))
        + createInput('fa-btn', 'Texto do Botão', document.querySelector('#about .about-link') ? document.querySelector('#about .about-link').innerText : '')
        + '<button id="btn-save-about" class="cadmin-btn">Salvar Alterações</button>';
      container.innerHTML = html;

      document.getElementById('btn-save-about').onclick = function() {
        setDOMValue('#about .about-label', 'text', document.getElementById('fa-lbl').value);
        setDOMValue('#about .about-title', 'text', document.getElementById('fa-title').value);
        setDOMValue('#about .about-desc', 'text', document.getElementById('fa-desc').value);
        setDOMValue('#about .about-img-wrap img', 'src', document.getElementById('fa-img').value);
        setDOMValue('#about .about-img-wrap img', 'alt', document.getElementById('fa-img-alt').value);
        var alink = document.querySelector('#about .about-link');
        if(alink) alink.innerHTML = document.getElementById('fa-btn').value + ' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
        alert('⚠️ ATENÇÃO: As alterações foram salvas APENAS na sua tela atual.\n\nPara enviar de verdade para o site oficial, vá na aba "🚀 Publicar" e clique em "Publicar Agora".');
      };
    }
    else if (tab === 'portfolio') {
      var headHtml = '<h2>Textos da Seção Portfólio</h2>'
        + createInput('fp-lbl', 'Rótulo', getDOMValue('#portfolio .portfolio-label', 'text'))
        + createInput('fp-title', 'Título', getDOMValue('#portfolio .portfolio-title', 'text'))
        + createInput('fp-btn', 'Texto do Botão', document.querySelector('#portfolio .btn-all') ? document.querySelector('#portfolio .btn-all').innerText : '')
        + '<button id="btn-save-port-text" class="cadmin-btn" style="margin-bottom:32px;">Salvar Textos</button>';
      
      var oldHtml = container.innerHTML;
      container.innerHTML = headHtml;
      
      document.getElementById('btn-save-port-text').onclick = function() {
        setDOMValue('#portfolio .portfolio-label', 'text', document.getElementById('fp-lbl').value);
        setDOMValue('#portfolio .portfolio-title', 'text', document.getElementById('fp-title').value);
        var pbtn = document.querySelector('#portfolio .btn-all');
        if(pbtn) pbtn.innerHTML = document.getElementById('fp-btn').value + ' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
        alert('⚠️ Textos do cabeçalho do portfólio salvos no DOM! Vá na aba Publicar para confirmar no servidor.');
      };

      // Also render the portfolio list editor
      var listDiv = document.createElement('div');
      listDiv.id = 'cadmin-port-list-wrap';
      container.appendChild(listDiv);
      renderPortfolioList(listDiv);
    }
    else if (tab === 'cta') {
      var html = '<h2>Contato (CTA)</h2>'
        + createInput('fc-hint', 'Rótulo / Dica', getDOMValue('#cta .cta-hint', 'text'))
        + createInput('fc-title', 'Título (HTML permitido)', getDOMValue('#cta .cta-title', 'html'))
        + createInput('fc-btn', 'Texto do Botão', document.querySelector('#cta .btn-primary') ? document.querySelector('#cta .btn-primary').innerText : '')
        + createInput('fc-lnk', 'Link do Botão', getDOMValue('#cta .btn-primary', 'href'))
        + '<button id="btn-save-cta" class="cadmin-btn">Salvar Alterações</button>';
      container.innerHTML = html;

      document.getElementById('btn-save-cta').onclick = function() {
        setDOMValue('#cta .cta-hint', 'text', document.getElementById('fc-hint').value);
        setDOMValue('#cta .cta-title', 'html', document.getElementById('fc-title').value);
        var cbtn = document.querySelector('#cta .btn-primary');
        if(cbtn) {
           cbtn.innerHTML = document.getElementById('fc-btn').value + ' <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
           cbtn.setAttribute('href', document.getElementById('fc-lnk').value);
        }
        alert('⚠️ ATENÇÃO: As alterações foram salvas APENAS na sua tela atual.\n\nPara enviar de verdade para o site oficial, vá na aba "🚀 Publicar" e clique em "Publicar Agora".');
      };
    }
    else if (tab === 'footer') {
      var spans = document.querySelectorAll('.footer-logo-text span');
      var t1 = spans.length > 0 ? spans[0].innerText : '';
      var t2 = spans.length > 1 ? spans[1].innerText : '';

      var fCols = document.querySelectorAll('.footer-col h4');
      var h1 = fCols.length > 0 ? fCols[0].innerText : '';
      var h2 = fCols.length > 1 ? fCols[1].innerText : '';
      var h3 = fCols.length > 2 ? fCols[2].innerText : '';

      var fContact = document.querySelectorAll('.footer-contact-item');
      var c1 = fContact.length > 0 ? fContact[0].innerText.trim() : '';
      var c2 = fContact.length > 1 ? fContact[1].innerText.trim() : '';
      var c3 = fContact.length > 2 ? fContact[2].innerText.trim() : '';

      var html = '<h2>Rodapé (Footer)</h2>'
        + '<h3>Textos da Logo</h3>'
        + createInput('ff-l1', 'Linha 1', t1)
        + createInput('ff-l2', 'Linha 2', t2)
        
        + '<h3 style="margin-top:24px;">Títulos das Colunas</h3>'
        + createInput('ff-h1', 'Coluna 1', h1)
        + createInput('ff-h2', 'Coluna 2', h2)
        + createInput('ff-h3', 'Coluna 3', h3)
        
        + '<h3 style="margin-top:24px;">Informações de Contato</h3>'
        + createInput('ff-c1', 'Telefone', c1)
        + createInput('ff-c2', 'Email', c2)
        + createInput('ff-c3', 'Endereço', c3)
        
        + '<h3 style="margin-top:24px;">Copyright</h3>'
        + createInput('ff-copy', 'Texto Base', getDOMValue('.footer-copy', 'text'))
        
        + '<button id="btn-save-footer" class="cadmin-btn" style="margin-top:24px;">Salvar Alterações</button>';
      container.innerHTML = html;

      document.getElementById('btn-save-footer').onclick = function() {
        var spans = document.querySelectorAll('.footer-logo-text span');
        if(spans.length > 0) spans[0].innerText = document.getElementById('ff-l1').value;
        if(spans.length > 1) spans[1].innerText = document.getElementById('ff-l2').value;

        var fCols = document.querySelectorAll('.footer-col h4');
        if(fCols.length > 0) fCols[0].innerText = document.getElementById('ff-h1').value;
        if(fCols.length > 1) fCols[1].innerText = document.getElementById('ff-h2').value;
        if(fCols.length > 2) fCols[2].innerText = document.getElementById('ff-h3').value;

        var fContact = document.querySelectorAll('.footer-contact-item');
        if(fContact.length > 0) fContact[0].innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> ' + document.getElementById('ff-c1').value;
        if(fContact.length > 1) fContact[1].innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> ' + document.getElementById('ff-c2').value;
        if(fContact.length > 2) fContact[2].innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ' + document.getElementById('ff-c3').value;

        setDOMValue('.footer-copy', 'text', document.getElementById('ff-copy').value);

        alert('⚠️ ATENÇÃO: As alterações foram salvas APENAS na sua tela atual.\n\nPara enviar de verdade para o site oficial, vá na aba "🚀 Publicar" e clique em "Publicar Agora".');
      };
    }
    else if (tab === 'advanced') {
      container.innerHTML = '<h2>🚀 Publicar no Site Ao Vivo</h2>'
        + '<div class="cadmin-form-group" style="margin-top:16px;">'
        + '  <label class="cadmin-label">URL da API (Vercel)</label>'
        + '  <input type="text" id="api-url" class="cadmin-input" value="/api/save" placeholder="Ex: https://seusite.vercel.app/api/save">'
        + '  <p style="color:#a0aabf;font-size:12px;margin-top:8px;">Se você está testando localmente (Live Server) ou em outra plataforma (como Lumi), digite a URL COMPLETA da sua Vercel acima. Se você já estiver acessando a Vercel, deixe apenas /api/save.</p>'
        + '</div>'
        + '<button id="btn-publish" class="cadmin-btn" style="background:#10b981;">Publicar Agora</button>'
        + '<div id="pub-status" style="margin-top:16px;font-size:14px;color:#60a5fa;"></div>';

      document.getElementById('btn-publish').onclick = function() {
        var apiUrl = document.getElementById('api-url').value.trim() || '/api/save';
        var status = document.getElementById('pub-status');
        status.innerText = 'Processando e enviando para o servidor...';
        
        var root = document.getElementById('root');
        var wasHidden = root.style.display === 'none';
        if (wasHidden) root.style.display = 'block'; // Mostra temporariamente para capturar
        
        // Remove o painel admin temporariamente para não enviá-lo junto
        var adminPanel = document.getElementById('certhus-admin-panel');
        var adminModal = document.getElementById('admin-modal');
        
        // REMOVE FROM DOM COMPLETELY SO IT DOES NOT GET SAVED!
        if (adminPanel) adminPanel.remove();
        if (adminModal) adminModal.remove();

        var finalHTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
        
        // ADD THEM BACK
        if (adminPanel) document.body.appendChild(adminPanel);
        if (adminModal) document.body.appendChild(adminModal);
        if (wasHidden) root.style.display = 'none';

        fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: _adminSecret, html: finalHTML })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            status.style.color = '#10b981';
            status.innerText = '✅ Sucesso! O novo site foi enviado ao GitHub e estará no ar em poucos instantes.';
            alert('🎉 SUCESSO! As alterações foram enviadas para o servidor com sucesso!\nO GitHub vai processar e a Vercel vai publicar o site novo em cerca de 1 a 2 minutos.\n\nVocê já pode fechar o painel e acompanhar a atualização do seu link público!');
          } else {
            status.style.color = '#ef4444';
            status.innerText = '❌ Erro: ' + (data.error || 'Falha ao salvar');
            alert('❌ O SERVIDOR RECUSOU A PUBLICAÇÃO! ❌\n\nDetalhes do Erro:\n' + JSON.stringify(data, null, 2) + '\n\nPor favor, tire uma foto ou copie essa mensagem e envie no chat para que eu possa consertar!');
          }
        })
        .catch(function(err) {
          status.style.color = '#ef4444';
          status.innerText = '❌ Erro de conexão: ' + err.message;
          alert('❌ ERRO CRÍTICO NA API OU CONEXÃO ❌\n\nDetalhes do Erro:\n' + err.message + '\n\nPor favor, tire uma foto ou copie essa mensagem e envie no chat para que eu possa consertar!');
        });
      };
    }
  }

    // --- 5. LÓGICA DO PORTFÓLIO ---
  function getPortfolioData() {
    try { return JSON.parse(document.getElementById('portfolio-data').textContent); } catch(e) { return []; }
  }
  function setPortfolioData(data) {
    document.getElementById('portfolio-data').textContent = '\n' + JSON.stringify(data, null, 2) + '\n';
    if(typeof renderPortfolio === 'function') renderPortfolio(); // Atualiza a tela
  }

  function renderPortfolioList(container) {
    container.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">'
      + '<h2>Portfólio</h2><button id="btn-add-proj" class="cadmin-btn">Novo Projeto</button></div>'
      + '<div id="proj-list"></div>';

    var listWrap = document.getElementById('proj-list');
    var projects = getPortfolioData();
    
    function drawList() {
      listWrap.innerHTML = '';
      projects.forEach(function(p, idx) {
        var div = document.createElement('div');
        div.className = 'cadmin-project-item';
        div.innerHTML = '<div class="cadmin-project-item-info">'
          + '<strong style="font-size:16px;">'+p.name+'</strong>'
          + '<span style="font-size:13px;color:#a0aabf;">'+p.subtitle+'</span>'
          + '</div>'
          + '<div style="display:flex;gap:8px;">'
          + '<button class="cadmin-btn-outline edit-btn" data-idx="'+idx+'">Editar</button>'
          + '<button class="cadmin-btn-danger cadmin-btn del-btn" data-idx="'+idx+'">Excluir</button>'
          + '</div>';
        listWrap.appendChild(div);
      });

      var editBtns = listWrap.querySelectorAll('.edit-btn');
      editBtns.forEach(function(btn) {
        btn.onclick = function() { editProjectForm(container, projects[btn.getAttribute('data-idx')], parseInt(btn.getAttribute('data-idx'))); };
      });
      var delBtns = listWrap.querySelectorAll('.del-btn');
      delBtns.forEach(function(btn) {
        btn.onclick = function() {
          if(confirm('Certeza que deseja excluir este projeto?')) {
            projects.splice(btn.getAttribute('data-idx'), 1);
            setPortfolioData(projects);
            drawList();
          }
        };
      });
    }

    drawList();

    document.getElementById('btn-add-proj').onclick = function() {
      var newP = {
        id: Date.now(),
        name: "Novo Projeto",
        subtitle: "Descrição curta",
        description: "Descrição completa",
        icon: "🚀",
        color: "linear-gradient(135deg,#1e3a8a,#1e1b4b)",
        tags: ["Web"],
        cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
        images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80"]
      };
      projects.push(newP);
      setPortfolioData(projects);
      editProjectForm(container, newP, projects.length - 1);
    };
  }

  function editProjectForm(container, p, idx) {
    container.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">'
      + '<h2>Editar Projeto</h2><button id="btn-back-proj" class="cadmin-btn-outline">Voltar</button></div>'
      + '<div class="cadmin-form-group"><label class="cadmin-label">Nome do Projeto</label><input type="text" id="fp-name" class="cadmin-input" value="'+(p.name||'')+'"></div>'
      + '<div class="cadmin-form-group"><label class="cadmin-label">Subtítulo</label><input type="text" id="fp-sub" class="cadmin-input" value="'+(p.subtitle||'')+'"></div>'
      + '<div class="cadmin-form-group"><label class="cadmin-label">Descrição Completa</label><textarea id="fp-desc" class="cadmin-textarea">'+(p.description||'')+'</textarea></div>'
      + '<div class="cadmin-form-group"><label class="cadmin-label">Ícone (Emoji)</label><input type="text" id="fp-icon" class="cadmin-input" value="'+(p.icon||'')+'"></div>'
      + '<div class="cadmin-form-group"><label class="cadmin-label">Tags (separadas por vírgula)</label><input type="text" id="fp-tags" class="cadmin-input" value="'+(p.tags||[]).join(', ')+'"></div>'
      + '<div class="cadmin-form-group"><label class="cadmin-label">Cor de Fundo (CSS linear-gradient ou cor HEX)</label><input type="text" id="fp-color" class="cadmin-input" value="'+(p.color||'')+'"></div>'
      + '<div class="cadmin-form-group"><label class="cadmin-label">Imagem da Capa (1 URL)</label><input type="text" id="fp-cover" class="cadmin-input" value="'+(p.cover||'')+'"></div>'
      + '<div class="cadmin-form-group"><label class="cadmin-label">Galeria de Imagens (URLs separadas por vírgula ou quebra de linha)</label><textarea id="fp-images" class="cadmin-textarea">'+(p.images||[]).join('\n')+'</textarea></div>'
      + '<button id="btn-save-p" class="cadmin-btn">Salvar Projeto</button>';

    document.getElementById('btn-back-proj').onclick = function() { renderPortfolioList(container); };

    document.getElementById('btn-save-p').onclick = function() {
      p.name = document.getElementById('fp-name').value;
      p.subtitle = document.getElementById('fp-sub').value;
      p.description = document.getElementById('fp-desc').value;
      p.icon = document.getElementById('fp-icon').value;
      p.color = document.getElementById('fp-color').value;
      p.cover = document.getElementById('fp-cover').value;
      
      var tagsArr = document.getElementById('fp-tags').value.split(',').map(function(t){ return t.trim(); }).filter(Boolean);
      p.tags = tagsArr;
      
      var imgsArr = document.getElementById('fp-images').value.split(/[\n,]+/).map(function(t){ return t.trim(); }).filter(Boolean);
      p.images = imgsArr;

      var projects = getPortfolioData();
      projects[idx] = p;
      setPortfolioData(projects);

      alert('Projeto salvo com sucesso!');
      renderPortfolioList(container);
    };
  }

})();
