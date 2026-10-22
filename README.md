# Matemagicando — Promo de Aniversário

Landing page estática (HTML + CSS + JavaScript puro, sem dependências de build).

## Estrutura

```
index.html              página
assets/css/style.css    estilos (fonte, editável)
assets/css/style.min.css  versão minificada que a página carrega
assets/js/main.js       scripts (fonte, editável)
assets/js/main.min.js   versão minificada que a página carrega
assets/img/             imagens (WebP) e vetores (SVG)
tools/build.js          gera os arquivos .min
```

## Publicar no GitHub Pages

1. Crie um repositório e envie todos os arquivos desta pasta para a raiz dele.
2. No repositório: **Settings → Pages → Build and deployment → Deploy from a branch**,
   escolha a branch `main` e a pasta `/ (root)`.
3. Em alguns minutos a página fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

Todos os caminhos são relativos, então funciona tanto em um domínio próprio
quanto em uma subpasta.

## Editar

- **Links dos botões:** no `index.html`, os botões gerais apontam para `#combos`.
  Os três botões dos combos e os links do rodapé estão com `href="#"` — troque
  pelo link de checkout de cada combo.
- **Preço do Combo Completo:** está como `R$ XX,XX` no `index.html`.
- **Estilos e scripts:** edite `style.css` / `main.js` e depois rode

  ```bash
  node tools/build.js
  ```

  para atualizar os arquivos `.min` (é só o Node, sem `npm install`).
  Para testar sem minificar, troque `style.min.css` por `style.css` e
  `main.min.js` por `main.js` no `index.html`.

## Larguras

A página tem largura total de **1920px** (acima disso fica centralizada) e o
conteúdo segue um grid de **1280px**. Os dois valores são variáveis no topo do
`style.css`: `--pagina` e `--grid`.

## Fontes

Space Grotesk e Sora são carregadas do Google Fonts.
