---
name: mermaid-flow
description: Geracao de diagramas .mmd (mermaid) para fluxos do projeto. Use quando precisar visualizar arquitetura, fluxograma UX (telas/decisoes do usuario) ou fluxograma tecnico (endpoints/estados/DB) de um perfil de usuario, modulo ou feature.
---

# mermaid-flow

Skill para gerar diagramas Mermaid (.mmd) consistentes para diferentes tipos
de fluxos no projeto.

## Quando invocar
- Documentar fluxo de um perfil de usuario (qualquer ator do dominio)
- Visualizar arquitetura de modulo ou integracao
- Mapear sequencia de chamadas API/DB para uma operacao critica

## Tipos de diagrama

### 1. Fluxograma UX (telas + decisoes do usuario)
- Salvar em `docs/flows/<perfil>-ux.mmd`
- Sintaxe: `flowchart TD` ou `flowchart LR`
- Nos = telas; decisoes = losangos; setas = transicoes
- Marcar estados especiais com classes: empty, error, loading

### 2. Fluxograma tecnico (estados + endpoints + DB)
- Salvar em `docs/flows/<perfil>-tech.mmd`
- Sintaxe: `sequenceDiagram` para sequencias temporais
- Atores: Cliente, API, DB, Servico externo
- Anotar endpoints REST/GraphQL, queries SQL, mensagens

### 3. Arquitetura de sistema
- Salvar em `docs/architecture/<modulo>.mmd`
- Sintaxe: `graph TB` ou `C4Component`
- Marcar boundaries de servico e fontes de verdade

## Convencoes
- Sempre incluir titulo via comentario `%% <Titulo do diagrama>`
- Usar IDs curtos mas legiveis (ex.: `LOGIN`, `HOME`, `ORDER_CREATE`)
- Cores via classDef para destacar nos criticos
- Maximo ~30 nos por diagrama; se ultrapassar, quebrar em sub-diagramas

## Template UX
```mermaid
%% Fluxo UX — Perfil <X>
flowchart TD
    SPLASH([Splash])
    ONBOARD[Onboarding]
    AUTH{Autenticado?}
    HOME[Home]
    ERROR[/Erro de conexao/]

    SPLASH --> ONBOARD --> AUTH
    AUTH -->|sim| HOME
    AUTH -->|nao| ERROR
    ERROR -.retry.-> AUTH

    classDef errorState fill:#fee,stroke:#c00,color:#400
    class ERROR errorState
```

## Template tecnico
```mermaid
%% Fluxo tecnico — Operacao critica generica
sequenceDiagram
    participant C as Cliente
    participant API
    participant DB
    participant Ext as Servico externo

    C->>API: POST /recurso
    API->>DB: INSERT INTO recurso
    DB-->>API: recurso_id
    API->>Ext: notify(destino)
    API-->>C: 201 {recurso_id, status: pending}
```
