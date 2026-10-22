// Gera as versões minificadas que o index.html carrega:
//   assets/css/style.css -> assets/css/style.min.css
//   assets/js/main.js    -> assets/js/main.min.js
//
// Uso (na raiz do projeto, sem instalar nada):  node tools/build.js
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const ler = (p) => fs.readFileSync(path.join(raiz, p), 'utf8');
const gravar = (p, conteudo) => fs.writeFileSync(path.join(raiz, p), conteudo);

function minificarCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // comentários
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .trim();
}

// Minificação conservadora: tira comentários e indentação, mantém uma
// instrução por linha (não renomeia nada nem junta linhas).
function minificarJs(js) {
  return js
    .split(/\r?\n/)
    .map((linha) => {
      const l = linha.trim();
      if (l.startsWith('//')) return '';
      const i = l.lastIndexOf(' // ');
      if (i > -1) {
        const antes = l.slice(0, i);
        const aspas = (antes.match(/['"]/g) || []).length;
        if (aspas % 2 === 0) return antes.trimEnd();
      }
      return l;
    })
    .filter(Boolean)
    .join('\n');
}

const tarefas = [
  ['assets/css/style.css', 'assets/css/style.min.css', minificarCss],
  ['assets/js/main.js', 'assets/js/main.min.js', minificarJs],
];

for (const [origem, destino, minificar] of tarefas) {
  const fonte = ler(origem);
  const saida = minificar(fonte);
  gravar(destino, saida + '\n');
  console.log(`${origem} (${fonte.length} bytes) -> ${destino} (${saida.length + 1} bytes)`);
}
