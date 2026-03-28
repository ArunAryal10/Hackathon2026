# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hackathon2026 project with a Python/Jupyter environment. Data is organized across three domains: Financial, HRV, and SelfReport.

## Environment

The local virtualenv is at `hackathon2026/` (Python 3.9). Activate it with:

```bash
source hackathon2026/bin/activate
```

Jupyter Lab is available in the virtualenv:

```bash
jupyter lab
```

## Repository Structure

```
Data/
  Financial/    # Financial data files
  HRV/          # Heart rate variability data
  SelfReport/   # Self-reported data
Docs/
  Backend/      # Backend documentation
  Frontend/     # Frontend documentation
```

## GitHub Remote

Remote is named `Hackathon2026` (not `origin`):

```bash
git push Hackathon2026 main
git pull Hackathon2026 main
```
