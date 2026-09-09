# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People with ADHD, depression, or autism who need a clean, workable planning interface with low distraction and clear structure.

## Product Purpose

BetterWeekToDo enables users to build concise weekly plans and manage their tasks without unnecessary cognitive or visual distraction. Success means a user can quickly understand the week, capture tasks, and maintain a workable plan.

## Positioning

The product combines a focused weekly planning workflow with remote-first account storage and complete self-hosting, keeping the planning experience concise while giving operators control of the data and deployment.

## Operating Context

Users review and update plans throughout the week, often in short sessions or during periods of limited attention and energy. The application is deployed and operated by the owner on their own infrastructure, typically behind HAProxy with PostgreSQL as the authoritative account storage.

## Capabilities and Constraints

- Weekly planning, task lists, task states, summaries, reminders, import/export, and browser-side caching.
- Optional account synchronization backed by PostgreSQL.
- Signed-in account data is remote-first; the browser cache supports offline continuity and backup/export but is not the authoritative copy.
- Built-in email/password authentication is the primary login method; an optional external OIDC provider such as Authentik may be enabled as a secondary option.
- Registration is configurable and disabled by default.
- The complete product must be self-hostable; no hosted service or mandatory third-party telemetry is required.
- Existing web implementation uses Vue and Vite, with Node.js and PostgreSQL for the account API.
- WebDAV sync and S3-compatible backup/storage remain future optional capabilities.

## Brand Commitments

The product name is BetterWeekToDo. The interface should remain concise, calm, and non-distracting.

## Evidence on Hand

The repository contains the working Vue web application, Node.js API, PostgreSQL schema, Docker deployment files, authentication flows, tests, and self-hosting documentation. No external customer research, testimonials, or performance claims are established; future work must not invent them.

## Product Principles

- Reduce cognitive load.
- Make the current week immediately understandable.
- Keep interactions concise and predictable.
- Preserve user and operator control through self-hosting and remote-first account storage.
- Treat accessibility as a core requirement, not an enhancement.

## Accessibility & Inclusion

Accessibility should be high and should account for users with ADHD, depression, and autism. Future work should prioritize clear hierarchy, low distraction, readable language, keyboard and screen-reader support, sufficient contrast, predictable interaction, reduced-motion support, and responsive layouts.
