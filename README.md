# 🖥️ Simulador de GPF (General Protection Fault) - Modo Real x86

Bem-vindo ao **Simulador de GPF**!  
Esse projeto foi feito para ajudar a galera a entender, de forma visual e interativa, como funciona a proteção de segmentos de memória no modo real da arquitetura x86 — e, claro, como um General Protection Fault (GPF) pode acontecer.

## O que é um GPF?

Um **GPF** (General Protection Fault) é aquele erro clássico que rola quando um segmento de memória tenta acessar o espaço de outro segmento, ou até mesmo um endereço inválido. No modo real do x86, isso pode acontecer fácil se você não tomar cuidado com os seletores e offsets dos segmentos.

## O que esse simulador faz?

- Permite escolher o endereço base do segmento CS (Código) em hexadecimal.
- Você escolhe qual segmento vai tentar invadir outro (origem e alvo).
- O simulador calcula e mostra:
  - O offset necessário para causar o GPF.
  - O endereço físico resultante.
  - Se rolou ou não o GPF, e em qual segmento.
- Mostra um **mapa visual da memória** e destaca o segmento invadido.
- Exibe todos os cálculos passo a passo, pra ninguém ficar perdido.

## Como usar

1. **Clone ou baixe o projeto**:
   ```bash
   git clone https://github.com/seu-usuario/gpf-simulator.git
   ```
2. **Abra o arquivo `index.html`** no seu navegador favorito.
3. Preencha os campos:
   - Endereço base do CS (ex: `3000`)
   - Segmento de origem (quem vai invadir)
   - Segmento alvo (quem vai ser invadido)
4. Clique em **Simular GPF** e veja a mágica acontecer!

## Por que usar?

- Pra estudar arquitetura x86 de um jeito mais visual.
- Pra entender como funciona a segmentação de memória.
- Pra ver, na prática, como um GPF pode ser causado.
- Pra usar em sala de aula, trabalhos ou só pra matar a curiosidade mesmo.

## Prints

![Exemplo de uso do simulador](docs/screenshot.png)

## Créditos

Feito com carinho por estudantes de Sistemas Operacionais, para estudantes de Sistemas Operacionais.  
Se quiser contribuir, abrir issues ou dar sugestões, fique à vontade!

---

**Divirta-se simulando (e causando) GPFs!** 🚨💻