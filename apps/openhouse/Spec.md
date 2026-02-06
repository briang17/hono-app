Open House Web App — Planning Blueprint

Goal
A mobile-first web app that allows real estate agents to create open house events, generate QR/sign-in experiences for visitors, and collect leads — integrated into an existing monorepo with shared auth, API, and database layers.

1. Core User Roles
Agent (Primary)

Authenticated user

Belongs to one or more organizations (via BetterAuth)

Can:

Create open house events

View and manage their own events

View leads per event

Visitor (Unauthenticated)

Accesses sign-in via:

QR code

Direct sign-in link

Submits lead information

No account required

Future: Admin (Out of Scope for v1)

Org-level or system-level visibility

Mentioned but intentionally excluded from initial planning

2. High-Level App Sections
A. Auth & Org Context

Uses existing BetterAuth setup

No separate auth service

App consumes:

user

organizationId

All data scoped per organization (even if UI is per-agent initially)

Important: Even if UI is “per agent”, the data model should already be org-scoped to avoid migrations later.

B. Agent Dashboard (Main View)

Route

/open-houses


Purpose

Landing page after login

Shows all open houses created by the agent (filtered by org + createdBy)

Mobile-first layout

List / cards

Each card:

Property address

Date & time

Listing price

Status (upcoming / past)

Quick link to details

Primary actions

“Create Open House”

Tap card → Open House Detail

C. Create Open House Flow

Route

/open-houses/new


Form Fields
Required:

Property address (string)

Listing price (number / formatted)

Date

Start time

End time

Optional:

Listing image (URL or upload later — see note below)

Notes

Keep image handling abstracted:

v1: URL field or deferred upload

Future: plug into existing file service if one exists

On submit:

Creates Open House

Redirects to detail page

D. Open House Detail Page

Route

/open-houses/:id


Structure
Tabbed interface (mobile-friendly segmented control)

Tab 1: Overview

Purpose

Quick reference for the agent

Content

Property address

Listing price

Date & time

Listing image (if present)

Shareable sign-in link (read-only preview)

Actions

Edit open house (future or v1-lite)

Copy sign-in link

Tab 2: QR & Flyer

Purpose

Enable physical + digital sign-in

Features

Auto-generated sign-in URL

QR Code generated from that URL

Actions

Download QR as PNG

Download printable flyer as PDF

Copy sign-in link

Implementation Notes

QR generation is frontend-driven (canvas / SVG → PNG)

Flyer:

Simple printable layout

Property address + QR

Generated client-side or via API (your call later)

Tab 3: Leads

Purpose

View all visitor sign-ins for this open house

Data Display

List or table (mobile stacked)

Fields:

Name

Email

Phone

Working with agent? (Yes / No)

Submitted at

Future-ready

Filters

Export CSV

Notes / tags

E. Visitor Sign-In Experience

Route

/sign-in/:openHouseId


(Outside authenticated app shell)

Purpose

Ultra-fast, mobile-friendly sign-in

Designed for people standing in a house

Form Fields (v1)
Required:

First name

Last name

Email OR phone (configurable later)

Optional:

“Are you currently working with an agent?” (Yes / No)

Behavior

Submit → confirmation message

No login

No redirects needed

Extensibility

Form schema should be:

Stored or versioned

Easily extended with:

Custom questions

Checkboxes

Free text

Consent fields

3. Data Model (Conceptual)

(Drizzle schemas later — this is logical structure)

OpenHouse

id

organizationId

createdByUserId

propertyAddress

listingPrice

date

startTime

endTime

listingImageUrl (nullable)

createdAt

updatedAt

OpenHouseLead

id

openHouseId

organizationId

firstName

lastName

email (nullable)

phone (nullable)

workingWithAgent (boolean | enum)

submittedAt

Future-Proofing (Not v1)

LeadAnswers (for dynamic forms)

CustomFormSchema

AgentNotes

Follow-up status

4. Frontend Architecture (Aligned with Your Desires)

Stack

React + Vite

Zustand (global state)

TanStack Query (server state)

React Router (manual routing, no file-based routing)

Axios

TanStack Form (or equivalent)

App Shell Structure
<App>
  <AuthProvider />
  <OrgProvider />
  <QueryClientProvider>
    <Router>
      <AuthenticatedLayout>
        /open-houses
        /open-houses/new
        /open-houses/:id
      </AuthenticatedLayout>

      <PublicLayout>
        /sign-in/:openHouseId
      </PublicLayout>
    </Router>
  </QueryClientProvider>
</App>

State Responsibilities

Zustand

Auth user snapshot

Active organization

UI state (tabs, modals)

TanStack Query

Open house lists

Open house details

Leads per open house

Mutations (create, update, submit lead)

5. API Boundary Expectations

Since /api already exists:

Agent APIs

POST /open-houses

GET /open-houses

GET /open-houses/:id

GET /open-houses/:id/leads

Public APIs

GET /open-houses/:id/public

POST /open-houses/:id/sign-in

Auth

All agent routes require BetterAuth session

Public routes are anonymous but validated by openHouseId

6. Mobile-First UX Principles (High-Level)

One-column layouts

Large tap targets

Minimal text entry

Fast load on weak Wi-Fi

No modals for core flows (especially visitor sign-in)

7. Agentic Planning Handoff (Why This Works)

This plan is:

Feature-complete but non-opinionated

Clear boundaries between:

Auth

Data

UI

Public vs private flows

Easily decomposable into:

Schema agent

API agent

Frontend routing agent

QR/flyer generation agent
