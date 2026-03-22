# OpenClaw - Personal AI Assistant

Self-hosted OpenClaw instance running on Hetzner Cloud, connected via WhatsApp.

## Infrastructure

| Resource | Value |
|----------|-------|
| **Cloud Provider** | Hetzner Cloud |
| **hcloud context** | `openclaw` |
| **Server Name** | `openclaw` |
| **Server ID** | `123130929` |
| **Location** | `ash` (Ashburn, VA) |
| **Server Type** | `cpx11` (2 shared vCPU, 2GB RAM, 40GB SSD) |
| **OS** | Ubuntu 24.04 LTS |
| **IPv4** | `178.156.132.46` |
| **IPv6** | `2a01:4ff:f0:bc84::1` |
| **Node.js** | v22.22.1 |
| **OpenClaw Version** | 2026.3.7 |
| **Claude Code Version** | 2.1.71 |
| **SSH Key** | `macbook` (from `~/.ssh/id_rsa.pub`) |
| **Non-root user** | `openclaw` |
| **Monthly cost (server)** | ~€4.49/mo (~$4.80) |

## GCP (project exists, VM deleted)

A GCP project `openclaw-mh-2026` was created with billing account `015234-84CF01-00AA96` ("Openclaw"). The VM was deleted but the project/billing account still exist. Consider cleaning up if not needed.

## SSH Access

```bash
# As non-root user (preferred)
ssh openclaw@178.156.132.46

# As root (avoid unless necessary)
ssh root@178.156.132.46

# Interactive Claude Code session (uses Max subscription)
ssh -t openclaw@178.156.132.46 "claude"
```

## LLM Configuration (3-tier routing)

| Tier | Model | Purpose | Cost |
|------|-------|---------|------|
| **Heartbeats** | `google/gemini-2.5-flash-lite` | 30-min background checks | ~$0.15/mo |
| **Daily chat** (primary) | `anthropic/claude-haiku-4-5` | WhatsApp conversation, simple tool use | ~$8-15/mo API |
| **Heavy tasks** (fallback) | `anthropic/claude-sonnet-4-6` | Complex reasoning, dangerous tool calls | ~$5-10/mo API |
| **Coding** | Claude Code CLI (`claude -p`) | Via Max subscription, spawned as subprocess | $0 (included in Max) |

- **Config file**: `~/.openclaw/openclaw.json`
- **Auth profiles**: `~/.openclaw/auth-profiles.json` (Anthropic API key + Google Gemini key)
- **Claude Code auth**: `~/.claude/` (Max subscription OAuth, logged in interactively)

### API Keys (stored on server)

- **Anthropic API key**: stored in `~/.openclaw/.env` and `~/.openclaw/auth-profiles.json` (starts with `sk-ant-api03-FDO...`)
- **Google Gemini API key**: stored in `~/.openclaw/.env` and `~/.openclaw/auth-profiles.json` (starts with `AIzaSyDqt...`)
- **Claude Max subscription**: OAuth credentials in `~/.claude/` on the VPS (authenticated interactively)

### Important: Anthropic OAuth Ban

Anthropic banned third-party tools from using Claude Pro/Max OAuth tokens directly (Feb 2026). Our setup:
- **OpenClaw daily chat**: uses Anthropic **API key** (pay-per-token) — fully allowed
- **Claude Code for coding**: uses the official `claude` CLI binary with Max subscription — allowed (it's Anthropic's own product)
- **Gray area**: OpenClaw spawning `claude -p` as subprocess — technically calls the real binary, community does this, but Anthropic hasn't explicitly blessed it

## WhatsApp

- **Status**: enabled in config, not yet paired
- **DM Policy**: `pairing` (new contacts need approval code)
- **Dedicated number**: TBD — researching options (virtual number, eSIM, or Telegram alternative)
- **Integration**: WhatsApp Web via QR code pairing

## Security Settings

- Non-root user `openclaw` for running the service
- Gateway bound to `loopback` (localhost only)
- Gateway auth mode: `token` (auto-generated on restart)
- DM policy: `pairing`
- Credential directory: `chmod 700`
- Performance optimizations: `NODE_COMPILE_CACHE` and `OPENCLAW_NO_RESPAWN` set in `.bashrc`

### Security warnings from audit (to address)

- Gateway auth token needs to be generated (restart will auto-create)
- Haiku is flagged as "below recommended tier" for security — acceptable since allowlist limits who can message

## Cost Estimate

| Component | Monthly Cost |
|-----------|-------------|
| Hetzner cpx11 | ~€4.49 (~$4.80) |
| Anthropic API (Haiku + Sonnet) | ~$10-20 |
| Gemini API (heartbeats) | ~$0.15 |
| Claude Max subscription (coding) | $200 (already paying) |
| **Total new costs** | **~$15-25/month** |

## Key Commands

```bash
# SSH into the server
ssh openclaw@178.156.132.46

# Check OpenClaw status
ssh openclaw@178.156.132.46 "openclaw status"

# View OpenClaw logs
ssh openclaw@178.156.132.46 "openclaw logs --follow"

# Run security audit
ssh openclaw@178.156.132.46 "openclaw security audit --deep"

# Stop/start OpenClaw
ssh openclaw@178.156.132.46 "openclaw stop"
ssh openclaw@178.156.132.46 "openclaw start"

# Run Claude Code task (uses Max subscription)
ssh openclaw@178.156.132.46 "claude -p 'your task here'"

# Interactive Claude Code session
ssh -t openclaw@178.156.132.46 "claude"

# Hetzner server management
hcloud context use openclaw
hcloud server list
hcloud server stop openclaw
hcloud server start openclaw

# View/edit OpenClaw config
ssh openclaw@178.156.132.46 "cat ~/.openclaw/openclaw.json"
ssh openclaw@178.156.132.46 "openclaw config set <path> <value>"
ssh openclaw@178.156.132.46 "openclaw config validate"
```

## Useful Guides

- [BitLaunch Install Guide](https://bitlaunch.io/blog/install-configure-openclaw/)
- [LumaDock WhatsApp Security Guide](https://lumadock.com/tutorials/openclaw-whatsapp-production-setup)
- [Official Docs - Security](https://docs.openclaw.ai/gateway/security)
- [Multi-model Routing Guide](https://velvetshark.com/openclaw-multi-model-routing)
- [Official Docs](https://docs.openclaw.ai)
- [PinchBench (agent model benchmarks)](https://pinchbench.com/)
- [CalypsoAI Security Leaderboard](https://calypsoai.com/calypsoai-model-leaderboard/)

## Model Selection Research Summary

Extensive research was done on model selection. Key findings:
- **PinchBench**: Cheap models top task completion (Gemini 3 Flash 95.1%) but are vulnerable to jailbreaks
- **Security**: Claude Sonnet 4 has best safety-to-cost ratio (CASI score 94.57, only 2.86% max-harm rate)
- **Avoid**: Grok (3.32 CASI), DeepSeek Reasoner (malformed tool calls), open-weight models (up to 92% jailbreak rate)
- **Community consensus**: Claude Haiku 4.5 for daily use, Sonnet/Opus for heavy tasks, Flash Lite for heartbeats

## TODO

- [ ] Connect messaging channel (WhatsApp or Telegram — researching number options)
- [ ] Run full security audit after gateway restart
- [ ] Set up systemd service for OpenClaw (auto-start on boot)
- [ ] Configure Claude Code subprocess integration for coding tasks
- [ ] Clean up GCP project/billing account
- [ ] Set spending limits on Anthropic API dashboard
