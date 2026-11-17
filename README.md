# Caderno de Libras: Projeto Integrador I

Projeto desenvolvido na disciplina **Projeto Integrador I** do Curso Técnico em Tradução e Interpretação de Libras Subsequente ao Ensino Médio do **Instituto Federal de Educação, Ciência e Tecnologia do Tocantins (IFTO)**, sob orientação da professora **Marianna Lima Batista Machado**.

- **Equipe:** Marco Antônio Queiroz e Nayara Bento da Silva Queiroz
- **Ano letivo:** 2026
- **Produto publicado:** <https://ifg-marco.github.io>

## Objetivo deste repositório

Reunir o **produto** (um aplicativo web) e a **documentação** do projeto, apresentados como requisito para a avaliação da disciplina Projeto Integrador I, para obtenção da nota da disciplina.

## Sobre o projeto

Estudantes de Libras, principalmente ouvintes que a aprendem como segunda língua, costumam conseguir reconhecer um sinal num vídeo, mas têm dificuldade em lembrá-lo e produzi-lo depois do primeiro contato. Os materiais disponíveis mostram o sinal, mas estão dispersos e não conduzem a tentativa, o retorno e a revisão ao longo do tempo. Em outras palavras, há um distanciamento entre o público geral e fontes de pesquisa de sinais apresentadas de forma contextualizada.

**Objetivo do projeto:** desenvolver um caderno digital bilíngue (Libras e Língua Portuguesa), com vídeos em Libras, cartões contextualizados e prática de revisão espaçada, para apoiar estudantes na retomada de sinais, e avaliar sua adequação linguística e sua usabilidade.

### O que o aplicativo oferece

- Cadernos temáticos de sinais, com situação em português, vídeo em Libras, tradução livre e observações de uso.
- Fluxo de estudo em quatro etapas: tentativa, revelação, autoavaliação e revisão espaçada.
- Criação, edição e exportação de cadernos próprios pelo estudante.
- Formulário curto de diagnóstico do perfil de estudo, opcional e sem exigência de identificação.

### Limitações declaradas

- O conteúdo em Libras ainda não foi validado por pessoa surda e/ou profissional qualificado de Libras.
- O teste de usabilidade com estudantes está planejado, mas seus resultados ainda não estão documentados.
- Os vídeos são trechos de vídeos públicos do YouTube, reproduzidos pelo player oficial, sem download nem republicação.

## Tecnologias

SvelteKit 2 com Svelte 5, TypeScript, Tailwind CSS 4, `adapter-static`, `vite-plugin-pwa` (instalável como PWA), IndexedDB (`idb`) para o progresso no aparelho, Zod para validação de dados e Vitest e Playwright para testes.

## Onde fica cada coisa

- **Código e documentação do app:** este repositório (pasta `Projeto/`).
- **Conteúdo da disciplina** (aulas por semana, trabalho, pareceres, estado da arte, livros e dicionários): mantido fora do repositório, em um cofre de anotações pessoal. Não é versionado aqui.
- **Projetos de código de apoio** (protótipos e scripts de dicionário): mantidos fora deste repositório, com mapa próprio.

## Estrutura do repositório

```
.
├── README.md                       # este arquivo
└── Projeto/
    ├── app/                        # código do aplicativo (SvelteKit)
    ├── notebooks/                  # fonte dos cadernos (JSON), editada à mão
    ├── skill/cadastrar-caderno-youtube/  # gera cadernos a partir de vídeos do YouTube
    ├── node-red/                   # fluxo do formulário de diagnóstico
    ├── trilhas/                    # trilhas de estudo
    ├── DIRETRIZES.md               # exigências da disciplina e estrutura do trabalho escrito
    ├── MAPA.md                     # decisões, escopo e checklist do projeto
    ├── github_pwa_migracao.md      # arquitetura atual (PWA)
    └── regras-software.md          # regras de desenvolvimento
```

## Como executar

Todos os comandos devem ser rodados dentro de `Projeto/app/`:

```bash
cd Projeto/app
npm install
npm run dev        # gera o manifesto dos cadernos e sobe o servidor local
npm run build      # manifesto, build estático e páginas de SEO
npm run check      # checagem de tipos (svelte-check)
npm test           # testes unitários (Vitest)
```

Para criar um caderno a partir de um vídeo do YouTube, veja `Projeto/skill/cadastrar-caderno-youtube/MANUAL.md`. O fluxo de edição dos cadernos está em `Projeto/notebooks/README.md`.

## Documentos de apoio

- Exigências da disciplina e estrutura do trabalho escrito: `Projeto/DIRETRIZES.md`
- Decisões, escopo e checklist: `Projeto/MAPA.md`
- Arquitetura atual do aplicativo: `Projeto/github_pwa_migracao.md`

Alguns documentos ainda descrevem fases anteriores do projeto e podem não refletir o aplicativo atual. A versão vigente está em `Projeto/github_pwa_migracao.md` e no código.

## Licença e uso

Projeto acadêmico, desenvolvido para a disciplina Projeto Integrador I. Os vídeos citados são de terceiros e permanecem de propriedade de seus autores.
