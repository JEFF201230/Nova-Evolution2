# PROGRAM-016 - IDENTITY STRATEGY

## Status

FOUNDATION DOCUMENT.

## Purpose

Define the identity model for users, operators, tenants, service accounts, and future integration principals.

## Strategy

- One canonical identity source.
- Human and service identities are separated.
- Identity must carry role, tenant, scope, and policy attributes.
- Identity resolution must be stable across missions and audits.
- Identity must support enterprise SSO later without redesign.

## Rules

- Identity is not inferred from runtime context alone.
- Identity changes must be auditable.
- Identity ownership remains explicit.

## Decision

Identity strategy ready.

