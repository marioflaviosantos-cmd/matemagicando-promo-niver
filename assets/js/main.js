(function () {
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------------
  // Revelação ao rolar (igual ao matemagicando.com.br): o elemento ganha
  // .ativo quando o topo dele passa do limite e perde quando volta para baixo,
  // então a animação se repete a cada passagem.
  // ------------------------------------------------------------------------
  var alvos = document.querySelectorAll(
    '.scroll-left, .scroll-right, .scroll-top, .scroll-bottom, .lista > li'
  );
  var hero = document.querySelector('.hero');
  var palco = document.querySelector('.hero__palco');
  var telaLarga = window.matchMedia('(min-width: 1024px)');
  var agendado = false;

  function atualizar() {
    agendado = false;
    var vh = window.innerHeight;
    var limite = Math.min(vh * 0.5 + 320, vh * 0.92);
    var noFim = window.scrollY + vh >= document.documentElement.scrollHeight - 2;

    for (var i = 0; i < alvos.length; i++) {
      var topo = alvos[i].getBoundingClientRect().top;
      alvos[i].classList.toggle('ativo', noFim || topo < limite);
    }

    // parallax da arte do hero (só em telas largas, como na referência)
    if (palco && hero && !reduzMovimento) {
      var p = telaLarga.matches ? Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1) : 0;
      palco.style.setProperty('--par', p.toFixed(3));
    }
  }

  function agendar() {
    if (!agendado) {
      agendado = true;
      requestAnimationFrame(atualizar);
    }
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  window.addEventListener('load', agendar);
  atualizar();

  // ------------------------------------------------------------------------
  // Carrossel de depoimentos: esteira contínua em loop, com velocidade
  // constante (como o carrossel de files.zeph.com.br/lp-tassio). Pausa com o
  // mouse em cima e pode ser arrastada com o mouse ou com o dedo.
  // ------------------------------------------------------------------------
  var VELOCIDADE = 32; // px por segundo

  function carrossel(faixa) {
    var trilho = faixa.querySelector('.depoimentos__trilho');
    if (!trilho || !trilho.children.length) return;
    var originais = Array.prototype.slice.call(trilho.children);

    // uma cópia do conjunto antes e outra depois, para o loop não ter emenda
    var antes = document.createDocumentFragment();
    var depois = document.createDocumentFragment();
    originais.forEach(function (card) {
      [antes, depois].forEach(function (destino) {
        var copia = card.cloneNode(true);
        copia.setAttribute('aria-hidden', 'true');
        var img = copia.querySelector('img');
        if (img) img.alt = '';
        destino.appendChild(copia);
      });
    });
    var primeiraCopiaDepois = depois.firstChild;
    trilho.insertBefore(antes, trilho.firstChild);
    trilho.appendChild(depois);

    var periodo = 0; // largura de um conjunto completo (cards + espaços)
    var pos = 0; // quanto o trilho já andou, em px
    var quadro = null;
    var ultimo = null;
    var arrastando = false;
    var pausas = { hover: false, fora: true };

    function medir() {
      // getBoundingClientRect dá a medida fracionada (os cards têm 194,47px)
      periodo = primeiraCopiaDepois.getBoundingClientRect().left - originais[0].getBoundingClientRect().left;
    }

    function aplicar() {
      if (!periodo) return;
      // mantém a posição sempre dentro do conjunto do meio
      pos = ((pos - periodo * 0.5) % periodo + periodo) % periodo + periodo * 0.5;
      trilho.style.transform = 'translate3d(' + (-pos).toFixed(2) + 'px, 0, 0)';
    }

    // como no layout: o conjunto original começa centralizado na tela
    function centralizar() {
      medir();
      var primeiro = originais[0].getBoundingClientRect();
      var espaco = originais.length > 1
        ? originais[1].getBoundingClientRect().left - primeiro.right
        : 0;
      pos = periodo + (periodo - espaco - faixa.clientWidth) / 2;
      aplicar();
    }

    function parado() {
      return reduzMovimento || arrastando || pausas.hover || pausas.fora || document.hidden;
    }

    function andar(agora) {
      if (ultimo !== null) {
        // limita o salto quando a aba volta de segundo plano
        var dt = Math.min(agora - ultimo, 100);
        pos += (VELOCIDADE * dt) / 1000;
        aplicar();
      }
      ultimo = agora;
      quadro = requestAnimationFrame(andar);
    }

    function tocar() {
      if (parado()) {
        if (quadro) cancelAnimationFrame(quadro);
        quadro = null;
        ultimo = null;
      } else if (!quadro) {
        quadro = requestAnimationFrame(andar);
      }
    }

    // pausa só com mouse de verdade (no toque o "hover" ficaria preso após um tap)
    faixa.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') { pausas.hover = true; tocar(); }
    });
    faixa.addEventListener('pointerleave', function () { pausas.hover = false; tocar(); });
    document.addEventListener('visibilitychange', tocar);

    // só anda enquanto o carrossel está na tela
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        pausas.fora = !entradas[0].isIntersecting;
        tocar();
      }).observe(faixa);
    } else {
      pausas.fora = false;
    }

    // arrastar (mouse ou dedo; a rolagem vertical da página continua normal)
    var xInicial = 0;
    var posInicial = 0;

    faixa.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      arrastando = true;
      xInicial = e.clientX;
      posInicial = pos;
      faixa.classList.add('arrastando');
      if (faixa.setPointerCapture) faixa.setPointerCapture(e.pointerId);
      tocar();
    });

    faixa.addEventListener('pointermove', function (e) {
      if (!arrastando) return;
      pos = posInicial - (e.clientX - xInicial);
      aplicar();
    });

    function soltar() {
      if (!arrastando) return;
      arrastando = false;
      faixa.classList.remove('arrastando');
      tocar();
    }

    faixa.addEventListener('pointerup', soltar);
    faixa.addEventListener('pointercancel', soltar);

    window.addEventListener('resize', function () {
      medir();
      aplicar();
    });

    centralizar();
    tocar();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-carrossel]'), carrossel);

  // ------------------------------------------------------------------------
  // Selo de garantia: a estrela só gira enquanto está visível.
  // ------------------------------------------------------------------------
  var selo = document.querySelector('.selo');
  if (selo) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        selo.classList.toggle('na-tela', entradas[0].isIntersecting);
      }).observe(selo);
    } else {
      selo.classList.add('na-tela');
    }
  }

  // ------------------------------------------------------------------------
  // FAQ em sanfona: começa fechado; abrir uma pergunta fecha a que estava
  // aberta. A altura é animada no CSS (grid 0fr → 1fr).
  // ------------------------------------------------------------------------
  var itensFaq = Array.prototype.slice.call(document.querySelectorAll('.faq__item'));

  function definir(item, aberto) {
    item.classList.toggle('aberto', aberto);
    var botao = item.querySelector('.faq__botao');
    if (botao) botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  }

  itensFaq.forEach(function (item) {
    var botao = item.querySelector('.faq__botao');
    if (!botao) return;
    botao.addEventListener('click', function () {
      var abrir = !item.classList.contains('aberto');
      itensFaq.forEach(function (outro) { definir(outro, false); });
      definir(item, abrir);
      // a altura da página muda: reavalia a revelação ao fim da transição
      setTimeout(agendar, 450);
    });
  });
})();
