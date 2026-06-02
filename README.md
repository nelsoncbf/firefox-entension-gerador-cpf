<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:3b47c9,100:00ADD8&height=160&section=header&text=Gerador%20de%20CPF&fontSize=36&fontColor=fff&fontAlignY=38&desc=Firefox%20Extension%20%7C%20For%20Testing%20Purposes%20Only&descAlignY=58&descSize=14" width="100%"/>

</div>

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-3b47c9?style=flat-square)
![Firefox](https://img.shields.io/badge/Firefox-Manifest%20V2-FF7139?style=flat-square&logo=firefox&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-00ADD8?style=flat-square)
![Author](https://img.shields.io/badge/author-nelsoncbf-3b47c9?style=flat-square&logo=github&logoColor=white)

</div>

---

> ⚠️ **Aviso legal:** Os CPFs gerados por esta extensão são matematicamente válidos, porém **não pertencem a nenhuma pessoa real**. Esta ferramenta foi desenvolvida exclusivamente para fins de teste em ambientes de desenvolvimento. O uso indevido é de inteira responsabilidade do usuário.

---

## 📋 Sobre

Extensão para Firefox que gera CPFs válidos matematicamente para uso em testes de software. Conta com histórico persistente, suporte a pin de favoritos e cópia rápida com ou sem formatação.

## ✨ Funcionalidades

- 🎲 **Geração de CPF** — algoritmo com cálculo real dos dígitos verificadores
- 📋 **Cópia rápida** — com pontuação (`123.456.789-09`) ou sem (`12345678909`)
- 💾 **Histórico automático** — cada CPF gerado é salvo automaticamente
- 📌 **Pin** — fixe CPFs importantes no topo da lista
- ✍️ **Adição manual** — insira e valide CPFs manualmente no histórico
- 🗑️ **Gerenciamento** — exclua itens individualmente ou limpe tudo de uma vez
- 💾 **Persistência** — histórico salvo via `browser.storage`, sobrevive ao fechamento do Firefox

## 🖥️ Interface

```
┌─────────────────────────────┐
│ 🔵 Gerador de CPF  [Gerar] [Histórico 3] │
├─────────────────────────────┤
│                             │
│   CPF gerado                │
│   123.456.789-09            │
│                             │
│  [Com pontuação] [Sem pontuação]         │
│                             │
│  ⚠️ Apenas para fins de teste...        │
└─────────────────────────────┘
```

## 🚀 Instalação

### Via Firefox Add-ons *(em breve)*
> A extensão será publicada em [addons.mozilla.org](https://addons.mozilla.org)

### Manualmente (modo desenvolvedor)

1. Clone o repositório
```bash
git clone https://github.com/nelsoncbf/firefox-entension-gerador-cpf.git
```

2. Abra o Firefox e acesse
```
about:debugging
```

3. Clique em **"Este Firefox"** → **"Carregar extensão temporária..."**

4. Selecione o arquivo `manifest.json` dentro da pasta clonada

5. O ícone da extensão aparecerá na barra de ferramentas ✅

## 🗂️ Estrutura do projeto

```
firefox-extension/
├── icons/
│   ├── icon-48.png
│   └── icon-96.png
├── popup/
│   ├── popup.html     # Interface
│   ├── popup.css      # Estilos
│   └── popup.js       # Lógica e API browser.*
└── manifest.json      # Configuração da extensão
```

## 🧠 Como funciona a geração do CPF

O algoritmo segue as regras oficiais da Receita Federal:

```python
# Pseudocódigo do algoritmo
base = 9 dígitos aleatórios

# Primeiro dígito verificador
soma = sum(base[i] * (10 - i) for i in range(9))
d1 = (soma * 10 % 11) if (soma * 10 % 11) < 10 else 0

# Segundo dígito verificador
soma = sum(base[i] * (11 - i) for i in range(9)) + d1 * 2
d2 = (soma * 10 % 11) if (soma * 10 % 11) < 10 else 0

cpf = base + [d1, d2]
```

## 🛠️ Permissões utilizadas

| Permissão | Motivo |
|---|---|
| `storage` | Salvar e recuperar o histórico de CPFs |
| `clipboardWrite` | Copiar CPFs para a área de transferência |
| `activeTab` | Acesso à aba atual (reservado para uso futuro) |

## 🗺️ Roadmap

- [ ] Publicação na Firefox Add-ons Store
- [ ] Versão para Chrome (Manifest V3)
- [ ] Geração em lote (múltiplos CPFs de uma vez)
- [ ] Exportar histórico como CSV
- [ ] Gerador de CNPJ

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma _issue_ ou enviar um _pull request_.

```bash
# Fork → clone → branch → commit → PR
git checkout -b feature/minha-feature
git commit -m "feat: minha feature"
git push origin feature/minha-feature
```

## 📄 Licença

MIT © [nelsoncbf](https://github.com/nelsoncbf)

---

<div align="center">

Desenvolvido por [@nelsoncbf](https://github.com/nelsoncbf) &nbsp;·&nbsp;
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-ffdd00?style=flat-square&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/nlsf)

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00ADD8,100:3b47c9&height=80&section=footer" width="100%"/>

</div>

