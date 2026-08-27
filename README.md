# UnderwriteOS

### The no-code underwriting operating system for lenders and fintechs.

UnderwriteOS is a no-code, AI-native underwriting platform that helps fintechs, lenders, insurers, and embedded-finance companies build policies visually, collect borrower applications through white-label forms with KYC, connect data providers, run risk assessments across five dimensions, and deliver explainable decisions — without writing code.

Instead of building underwriting infrastructure from scratch, teams can use UnderwriteOS to build policies in a visual rule builder, collect applications via white-label intake forms, connect credit bureau and open banking data, evaluate decisions with full evidence lineage, and move from prototype to production across six markets.

**Build the decision layer. Not the infrastructure around it.**

---

## Why UnderwriteOS?

Traditional underwriting systems are expensive to build and difficult to evolve.

Teams typically have to build and maintain:

* Data-provider integrations
* Risk and eligibility rules
* Decision workflows
* Applicant evaluation pipelines
* Sandbox environments
* Audit trails
* Model and policy evaluation
* Developer authentication
* Production integrations
* Monitoring and decision analytics

UnderwriteOS provides these capabilities as a unified infrastructure layer.

The goal is simple:

> **Give developers the building blocks to ship reliable underwriting systems without rebuilding the underwriting stack.**

---

## What UnderwriteOS Provides

### 1. Developer Workspaces

Create an isolated environment for each organization.

Each workspace can include:

* Organization configuration
* Development environment
* Sandbox environment
* API credentials
* Environment-specific configuration
* Usage and integration settings

Developers can get started without manually configuring infrastructure.

---

### 2. Sandbox-First Development

Test underwriting workflows before connecting them to production systems.

The sandbox environment is designed for:

* Test applicants
* Synthetic underwriting scenarios
* Provider integration testing
* Policy experimentation
* Decision testing
* Integration development

This makes it possible to build and validate underwriting workflows without immediately exposing production data or systems.

---

### 3. Provider Integrations

Connect external data providers to underwriting workflows through a standardized integration layer.

Provider integrations can supply information such as:

* Identity data
* Financial information
* Credit information
* Business information
* Fraud signals
* Other risk-related data

The platform abstracts provider-specific implementation details so applications can consume underwriting data through a consistent interface.

---

### 4. Underwriting Decision Engine

Turn raw applicant data into structured underwriting decisions.

A workflow can combine:

**Applicant data → Data providers → Rules / policies → Risk evaluation → Decision**

Typical outcomes can include:

* Approve
* Decline
* Refer for review

Decision workflows can be configured to reflect the underwriting requirements of each business.

---

### 5. Policy & Rule Configuration

Define the logic that determines whether an application meets underwriting requirements.

Policies can incorporate:

* Eligibility criteria
* Risk thresholds
* Business rules
* Required data
* Decision conditions
* Manual-review conditions

This allows underwriting logic to evolve without rebuilding the entire application.

---

### 6. AI-Ready Architecture

UnderwriteOS is designed for the next generation of underwriting systems.

AI and machine-learning models can be incorporated into workflows while keeping deterministic business rules and decision controls separate.

This enables teams to combine:

**Data + Rules + Models + AI + Human Review**

within a controlled underwriting workflow.

AI should assist underwriting—not become an uncontrolled black box.

---

### 7. Decision Traceability

Every underwriting decision should be explainable.

UnderwriteOS is designed around structured decision records that can capture:

* Inputs
* Data sources
* Rules evaluated
* Risk signals
* Decision outcomes
* Review requirements
* Execution context

This creates an auditable trail for debugging, operations, compliance, and future model evaluation.

---

### 8. Environment Separation

UnderwriteOS separates development and production concerns.

Typical environments include:

```text
Development
    ↓
Sandbox
    ↓
Production
```

This enables teams to safely test changes before deploying underwriting workflows to production.

---

## Architecture

At a high level:

```text
                    ┌─────────────────────┐
                    │   Your Application  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     UnderwriteOS    │
                    │      API Layer      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │   Data     │   │  Policies  │   │ AI / ML    │
       │ Providers  │   │  & Rules   │   │ Evaluation │
       └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │ Underwriting Engine │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Decision        │
                    │ Approve / Review /  │
                    │       Decline       │
                    └─────────────────────┘
```

---

## Developer Experience

UnderwriteOS is designed around a self-service developer experience.

### Typical workflow

```text
Create Organization
        ↓
Create Workspace
        ↓
Create Sandbox
        ↓
Configure API Access
        ↓
Connect Providers
        ↓
Create Underwriting Workflow
        ↓
Test with Sandbox Data
        ↓
Evaluate Decisions
        ↓
Deploy
```

The objective is to reduce the amount of infrastructure a development team needs to build before they can start experimenting with underwriting.

---

## Example Use Cases

UnderwriteOS can support underwriting workflows across multiple financial and risk-based products.

### Lending

* Consumer lending
* SME lending
* Embedded lending
* BNPL
* Credit applications

### Insurance

* Applicant risk assessment
* Eligibility decisions
* Automated policy screening
* Claims-related risk workflows

### Fintech

* Account risk
* Transaction risk
* Fraud screening
* Financial eligibility

### Embedded Finance

Build underwriting directly into products without building an underwriting infrastructure stack from scratch.

---

## Core Principles

### API-first

Underwriting infrastructure should be accessible programmatically.

### Sandbox-first

Developers should be able to test safely before touching production.

### Explainable decisions

Risk decisions should provide enough context to understand why a decision occurred.

### Provider abstraction

Applications should not need to tightly couple their underwriting logic to individual data providers.

### Deterministic controls

Business-critical decisions should remain governed by explicit policies and rules.

### AI-compatible

AI and machine learning should enhance underwriting workflows while remaining observable and controllable.

---

## Project Structure

```text
underwriteos/
├── base44/
├── src/
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.js
└── ...
```

The application is built with a modern web stack and is designed to evolve into a production-grade underwriting infrastructure platform.

---

## Getting Started

### Prerequisites

You will need:

* Node.js
* npm
* A configured UnderwriteOS development environment

### Install

```bash
git clone https://github.com/akinfakokunde/underwriteos.git

cd underwriteos

npm install
```

### Run locally

```bash
npm run dev
```

The development server will provide a local URL where you can access the application.

---

## Environment Variables

Create a local environment file for development credentials and configuration.

```bash
cp .env.example .env
```

Never commit secrets, API keys, database credentials, or production credentials to the repository.

---

## Development

Install dependencies:

```bash
npm install
```

Start development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Security

UnderwriteOS is designed for infrastructure where financial and risk-related data may be involved.

When contributing or deploying:

* Never commit secrets
* Never expose production credentials
* Use environment-specific credentials
* Keep sandbox and production data isolated
* Validate provider responses
* Apply authentication and authorization to protected APIs
* Log decisions without unnecessarily exposing sensitive applicant data

If you discover a security vulnerability, please do not open a public issue containing sensitive information.

---

## Roadmap

The long-term vision for UnderwriteOS is to become a programmable underwriting infrastructure layer.

Planned areas include:

* [ ] Configurable underwriting policies
* [ ] More data-provider integrations
* [ ] Production provider connectivity
* [ ] Advanced decision workflows
* [ ] Risk scoring
* [ ] AI-assisted underwriting
* [ ] Model evaluation
* [ ] Decision analytics
* [ ] Policy versioning
* [ ] Decision replay
* [ ] Webhooks and event-driven workflows
* [ ] Advanced audit capabilities
* [ ] Enterprise controls
* [ ] SDKs and developer tooling

---

## Contributing

Contributions, feedback, and ideas are welcome.

If you want to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add or update tests where appropriate
5. Open a pull request

Please keep pull requests focused and explain the problem your change solves.

---

## Vision

Underwriting is becoming software.

As financial products become more embedded, underwriting cannot remain a collection of disconnected spreadsheets, provider integrations, rules engines, and manual processes.

**UnderwriteOS is building the infrastructure layer that makes underwriting programmable.**

```text
Data
  +
Policies
  +
AI / Models
  +
Decision Infrastructure
        ↓
Programmable Underwriting
```

---

## Status

🚧 **Under active development**

UnderwriteOS is currently being developed as an early-stage underwriting infrastructure platform.

The public repository is intended to provide visibility into the platform's architecture and development while the product continues to evolve.

---

## License

This project is currently under development.

License information will be added as the project moves toward its public release.