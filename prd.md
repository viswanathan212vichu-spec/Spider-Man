Demo Project PRD: Role-Based Event Management System
Assumptions (Explicit)

Two roles only: Admin and User

Admin manages events

User can view events and book them

Payment is simulated or sandboxed (no real gateway complexity)

Single web application

Authentication is basic (login + role check)

1. One-Sentence Problem

Event organizers and attendees struggle to manage events and bookings in one system because roles and responsibilities are mixed, resulting in poor control, booking errors, and manual payment handling.

2. Demo Goal (What Success Looks Like)

The demo is successful if:

Admin can log in and manage events

User can log in and view available events

User can book an event and complete a payment flow

Role-based access is clearly enforced

The demo should clearly communicate:
“Admins control events; users book events and pay securely.”

Non-Goals (Out of Scope):

Refunds

Seat selection

Email/SMS confirmations

Multiple admins

3. Target User (Role-Based)

Primary Role: Event Attendee (User)

Context: Booking events online

Skill Level: Basic web usage

Key Constraint: Wants quick booking with minimal steps

Secondary Role: Admin (System Owner)

Manages events and updates

4. Core Use Case (Happy Path)

Start Condition:
User opens the application and logs in.

Flow:

User logs in as User

User views list of available events

User selects an event

User clicks “Book Event”

User proceeds to payment

Payment is successful

Booking confirmation is shown

End Condition:
User successfully books an event with confirmed payment.

(If this works, the demo works.)

5. Functional Decisions (What It Must Do)
ID	Function	Notes
F1	User authentication	Login with role identification
F2	Role-based access control	Admin vs User permissions
F3	Admin creates events	Admin-only
F4	Admin updates events	Admin-only
F5	Admin deletes events	Admin-only
F6	User views events	Read-only access
F7	User books events	Requires login
F8	Payment processing	Demo / sandbox payment
F9	Booking confirmation	After successful payment
6. UX Decisions (What the Experience Is Like)
6.1 Entry Point

Login page

After login:

Admin → Admin Dashboard

User → Event Listing Page

6.2 Inputs

Admin Inputs:

Event name

Date & time

Venue

Price

Description

User Inputs:

Event selection

Payment details (simulated)

6.3 Outputs

Event list

Event details page

Booking confirmation screen

Payment success message

6.4 Feedback & States

Loading: “Processing payment…”

Success: “Booking confirmed”

Failure: “Payment failed”

Empty State: “No events available”

6.5 Errors (Minimum Viable Handling)

Invalid login → “Invalid credentials”

Unauthorized access → “Access denied”

Payment failure → Retry option

No user action → System remains idle

7. Data & Logic (At a Glance)
7.1 Inputs

User credentials

Admin event data

User booking request

Payment status (mocked/API)

7.2 Processing

Login → role check → route user

Admin input → validate → save event

User select event → initiate payment → confirm booking

7.3 Outputs

UI display

Temporary booking records

Payment status logs