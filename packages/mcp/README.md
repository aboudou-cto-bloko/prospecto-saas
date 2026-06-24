# prospecto-mcp

Serveur MCP pour **Prospecto** — Gère ton pipeline de prospection avec l'IA.

## Installation

```bash
npx prospecto-mcp
```

## Configuration

### Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `PROSPECTO_API_KEY` | Oui | Clé API (générer dans Settings → Organisation) |
| `PROSPECTO_URL` | Non | URL de l'instance (défaut: https://prospecto.aboudouzinsou.site) |

### Claude Desktop

Ajoute dans `~/.claude/claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "prospecto": {
      "command": "npx",
      "args": ["-y", "prospecto-mcp"],
      "env": {
        "PROSPECTO_API_KEY": "psk_ta_cle_ici"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add prospecto -- npx -y prospecto-mcp
```

Puis set la variable :
```bash
export PROSPECTO_API_KEY=psk_ta_cle_ici
```

### Cursor / Windsurf

Ajoute dans `.cursor/mcp.json` :

```json
{
  "mcpServers": {
    "prospecto": {
      "command": "npx",
      "args": ["-y", "prospecto-mcp"],
      "env": {
        "PROSPECTO_API_KEY": "psk_ta_cle_ici"
      }
    }
  }
}
```

## Tools disponibles

| Tool | Description | Crédits |
|---|---|---|
| `list_prospects` | Lister/rechercher les prospects | 0 |
| `get_prospect` | Détails d'un prospect | 0 |
| `create_prospect` | Ajouter un prospect | 1 |
| `update_prospect` | Modifier un prospect | 1 |
| `delete_prospect` | Supprimer un prospect | 0 |
| `get_stats` | Dashboard stats | 0 |
| `list_campaigns` | Lister les campagnes | 0 |
| `create_campaign` | Créer une campagne | 1 |
| `list_tags` | Lister les tags | 0 |
| `scrape_goafrica` | Scraper GoAfricaOnline | 5 |

## Exemples d'usage

> "Montre-moi mes prospects qualifiés"

> "Ajoute le restaurant Le Palmier, +22997001122, catégorie restaurants"

> "Change le statut de Dr Nappy en converti"

> "Scrape les pharmacies à Cotonou"

> "Combien de crédits il me reste ?"
