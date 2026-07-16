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
      + '<div class="cadmin-nav-item" data-tab="cta">📞 Contato</div>'
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

    if (tab === 'hero') {
      var html = '<h2>Início (Hero)</h2>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Título Principal (HTML permitido)</label><input type="text" id="fh-title" class="cadmin-input"></div>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Descrição</label><textarea id="fh-desc" class="cadmin-textarea"></textarea></div>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Botão 1 - Texto</label><input type="text" id="fh-b1t" class="cadmin-input"></div>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Botão 2 - Texto</label><input type="text" id="fh-b2t" class="cadmin-input"></div>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Botão 2 - Link</label><input type="text" id="fh-b2l" class="cadmin-input"></div>'
        + '<button id="btn-save-hero" class="cadmin-btn">Salvar Alterações</button>';
      container.innerHTML = html;

      document.getElementById('fh-title').value = getDOMValue('#hero .hero-title', 'html');
      document.getElementById('fh-desc').value = getDOMValue('#hero .hero-desc', 'text');
      document.getElementById('fh-b1t').value = getDOMValue('#hero .btn-primary', 'text');
      document.getElementById('fh-b2t').value = getDOMValue('#hero .btn-outline', 'text');
      document.getElementById('fh-b2l').value = getDOMValue('#hero .btn-outline', 'href');

      document.getElementById('btn-save-hero').onclick = function() {
        setDOMValue('#hero .hero-title', 'html', document.getElementById('fh-title').value);
        setDOMValue('#hero .hero-desc', 'text', document.getElementById('fh-desc').value);
        setDOMValue('#hero .btn-primary', 'text', document.getElementById('fh-b1t').value);
        
        var b2 = document.querySelector('#hero .btn-outline');
        if(b2) {
          b2.innerHTML = document.getElementById('fh-b2t').value + ' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
          b2.setAttribute('href', document.getElementById('fh-b2l').value);
        }
        alert('Salvo no DOM!');
      };
    }
    else if (tab === 'services') {
      container.innerHTML = '<h2>Serviços</h2><p style="color:#a0aabf;margin-bottom:24px;">Edite os 3 serviços principais.</p><div id="srv-list"></div><button id="btn-save-srv" class="cadmin-btn">Salvar Alterações</button>';
      var list = document.getElementById('srv-list');
      var items = document.querySelectorAll('#services-strip .service-item');
      var srvData = [];
      items.forEach(function(item, idx) {
        srvData.push({
          icon: item.querySelector('.service-icon').innerHTML,
          title: item.querySelector('.service-title').innerText,
          desc: item.querySelector('.service-desc').innerText
        });
        var div = document.createElement('div');
        div.className = 'cadmin-form-group';
        div.style.padding = '16px'; div.style.background = '#1e222b'; div.style.borderRadius = '8px';
        div.innerHTML = '<h4>Serviço '+(idx+1)+'</h4>'
          + '<label class="cadmin-label" style="margin-top:12px">Título</label><input type="text" id="srv-t-'+idx+'" class="cadmin-input" value="'+srvData[idx].title+'">'
          + '<label class="cadmin-label" style="margin-top:12px">Descrição</label><textarea id="srv-d-'+idx+'" class="cadmin-textarea" style="min-height:60px">'+srvData[idx].desc+'</textarea>'
          + '<label class="cadmin-label" style="margin-top:12px">Ícone (SVG)</label><input type="text" id="srv-i-'+idx+'" class="cadmin-input" value=\''+srvData[idx].icon.replace(/'/g,"&apos;")+'\'>';
        list.appendChild(div);
      });

      document.getElementById('btn-save-srv').onclick = function() {
        items.forEach(function(item, idx) {
          item.querySelector('.service-title').innerText = document.getElementById('srv-t-'+idx).value;
          item.querySelector('.service-desc').innerText = document.getElementById('srv-d-'+idx).value;
          item.querySelector('.service-icon').innerHTML = document.getElementById('srv-i-'+idx).value;
        });
        alert('Salvo no DOM!');
      };
    }
    else if (tab === 'about') {
      var html = '<h2>Sobre</h2>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Rótulo</label><input type="text" id="fa-lbl" class="cadmin-input"></div>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Título</label><input type="text" id="fa-title" class="cadmin-input"></div>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Descrição</label><textarea id="fa-desc" class="cadmin-textarea"></textarea></div>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Imagem (URL)</label><input type="text" id="fa-img" class="cadmin-input"></div>'
        + '<button id="btn-save-about" class="cadmin-btn">Salvar Alterações</button>';
      container.innerHTML = html;

      document.getElementById('fa-lbl').value = getDOMValue('#about .about-label', 'text');
      document.getElementById('fa-title').value = getDOMValue('#about .about-title', 'text');
      document.getElementById('fa-desc').value = getDOMValue('#about .about-desc', 'text');
      document.getElementById('fa-img').value = getDOMValue('#about .about-img-wrap img', 'src');

      document.getElementById('btn-save-about').onclick = function() {
        setDOMValue('#about .about-label', 'text', document.getElementById('fa-lbl').value);
        setDOMValue('#about .about-title', 'text', document.getElementById('fa-title').value);
        setDOMValue('#about .about-desc', 'text', document.getElementById('fa-desc').value);
        setDOMValue('#about .about-img-wrap img', 'src', document.getElementById('fa-img').value);
        alert('Salvo no DOM!');
      };
    }
    else if (tab === 'portfolio') {
      renderPortfolioList(container);
    }
    else if (tab === 'cta') {
      var html = '<h2>Contato (CTA)</h2>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Rótulo / Dica</label><input type="text" id="fc-hint" class="cadmin-input"></div>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Título</label><input type="text" id="fc-title" class="cadmin-input"></div>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Texto do Botão</label><input type="text" id="fc-btn" class="cadmin-input"></div>'
        + '<div class="cadmin-form-group"><label class="cadmin-label">Link do Botão</label><input type="text" id="fc-lnk" class="cadmin-input"></div>'
        + '<button id="btn-save-cta" class="cadmin-btn">Salvar Alterações</button>';
      container.innerHTML = html;

      document.getElementById('fc-hint').value = getDOMValue('#cta .cta-hint', 'text');
      document.getElementById('fc-title').value = getDOMValue('#cta .cta-title', 'html');
      
      var ctaBtn = document.querySelector('#cta .btn-primary');
      if(ctaBtn) {
        document.getElementById('fc-btn').value = ctaBtn.innerText;
        document.getElementById('fc-lnk').value = ctaBtn.getAttribute('href') || '';
      }

      document.getElementById('btn-save-cta').onclick = function() {
        setDOMValue('#cta .cta-hint', 'text', document.getElementById('fc-hint').value);
        setDOMValue('#cta .cta-title', 'html', document.getElementById('fc-title').value);
        if(ctaBtn) {
          ctaBtn.innerHTML = document.getElementById('fc-btn').value + ' <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
          ctaBtn.setAttribute('href', document.getElementById('fc-lnk').value);
        }
        alert('Salvo no DOM!');
      };
    }
    else if (tab === 'advanced') {
      container.innerHTML = '<h2>🚀 Publicar no Site Ao Vivo</h2><p style="color:#ef4444;margin-bottom:12px;font-size:12px;font-weight:600;">⚠️ Atenção: A publicação só funciona se você acessar este painel pelo link online da Vercel. Não funciona acessando o arquivo local (file://) no seu computador.</p>'
        + '<p style="color:#a0aabf;margin-bottom:24px;">Isso irá compilar todo o HTML e enviá-lo para a Vercel através do seu Github.</p>'
        + '<button id="btn-publish" class="cadmin-btn" style="background:#10b981;">Publicar Agora</button>'
        + '<div id="pub-status" style="margin-top:16px;font-size:14px;color:#60a5fa;"></div>';

      document.getElementById('btn-publish').onclick = function() {
        var status = document.getElementById('pub-status');
        status.innerText = 'Processando e enviando para o servidor...';
        
        var root = document.getElementById('root');
        var wasHidden = root.style.display === 'none';
        if (wasHidden) root.style.display = 'block'; // Mostra temporariamente para capturar
        
        // Remove o painel admin temporariamente para não enviá-lo junto
        var adminPanel = document.getElementById('certhus-admin-panel');
        var adminModal = document.getElementById('admin-modal');
        if (adminPanel) adminPanel.style.display = 'none';
        if (adminModal) adminModal.style.display = 'none';

        var finalHTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
        
        if (adminPanel) adminPanel.style.display = '';
        if (wasHidden) root.style.display = 'none';

        fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: _adminSecret, content: finalHTML })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            status.style.color = '#10b981';
            status.innerText = '✅ Sucesso! O novo site foi enviado ao GitHub e estará no ar em poucos instantes.';
          } else {
            status.style.color = '#ef4444';
            status.innerText = '❌ Erro: ' + (data.error || 'Falha ao salvar');
          }
        })
        .catch(function(err) {
          status.style.color = '#ef4444';
          status.innerText = '❌ Erro de conexão: ' + err.message;
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
