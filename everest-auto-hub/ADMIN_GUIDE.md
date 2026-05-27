# Everest Auto Hub — Admin User Guide

## Getting Started

**Login URL:** `http://localhost:3000/login` (or your live domain)  
**Default credentials:**
- Email: `admin@everestautohub.com`
- Password: `admin123`

> ⚠️ Change your password immediately after first login via **Settings → Change Password**

After logging in you will be redirected to the Admin Panel at `/admin`.

---

## Admin Panel Overview

The sidebar on the left contains all sections. The topbar shows a **bell icon** with live notification counts for pending items.

| Sidebar Item | What it does |
|---|---|
| Dashboard | Overview stats + revenue charts |
| Home Page | Edit home page text and images |
| Site Content | Edit all other pages (About, Contact, etc.) |
| Notices | Create popups shown to all visitors |
| Services | Manage auto services |
| Appointments | View and manage bookings |
| Products | Manage shop products |
| Orders | View and process customer orders |
| Users | View registered users |
| Reviews | Approve or reject customer reviews |
| Settings | Change your profile, password, currency |

---

## 1. Dashboard

Shows at a glance:
- **Total Revenue** — sum of delivered orders + completed appointments
- **Users, Appointments, Orders, Products** counts
- **Pending** counts for orders and appointments
- **Revenue bar chart** — monthly revenue for last 6 months (only counts delivered orders)
- **Orders line chart** — orders per month

> Revenue only increases when you mark an order as **Delivered** or an appointment as **Completed**.

---

## 2. Home Page Editor (`/admin/home`)

Edit everything visible on the home page:

| Section | What you can change |
|---|---|
| Hero | Badge text, subtitle, background image |
| Services Section | Tag, title, subtitle text |
| Why Choose Us | Title, description, workshop image |
| Shop Banner | Tag, title, description, background image |
| CTA Banner | Title, subtitle, phone number |

**How to upload an image:**
1. Click **Upload Image** next to any image field
2. Select a photo from your computer (JPG, PNG, WebP — max 5MB)
3. A preview appears immediately
4. Click **Save All Changes** at the top right

> Images are stored on Cloudinary — they are permanent and won't be lost on server restart.

---

## 3. Site Content Manager (`/admin/site-content`)

Edit content for every other page. Use the tabs at the top to switch between pages.

### About Tab
- Edit hero banner text and image
- Edit the "Who We Are" story paragraphs and image
- **Team Members** — add, edit, or remove team members with name, role, experience, and photo

### Services Tab
- Edit the hero banner for the Services page
- Individual services are managed in the **Services** section

### Contact Tab
- Edit address, phone numbers, email, working hours
- **Google Maps Embed** — paste a Google Maps embed URL to show a map on the contact page
  - Go to Google Maps → search your address → Share → Embed a map → copy the `src="..."` URL only

### Appointment Tab
- Edit hero banner
- Edit the "Why Book With Us" bullet points — add or remove points
- Edit the phone and email shown on the booking page

### Shop Tab
- Edit the hero banner for the Shop page

### Footer Tab
- Edit tagline, phone, email, address, copyright text

**Always click Save Changes after editing any tab.**

---

## 4. Notices & Offers (`/admin/notices`)

Create popups that appear to all visitors when they open the website.

**To create a notice:**
1. Click **New Notice**
2. Select a type: Info / Offer / Warning / Event
3. Enter a **Title** (required)
4. Add a **Message** (optional — extra details)
5. Upload an **Image/Banner** (optional — great for promotions)
6. Set an **Expiry Date** (optional — leave empty to show indefinitely)
7. Check **Publish immediately** to make it live
8. Click **Publish Notice**

**Managing notices:**
- Toggle the switch icon to pause/activate a notice without deleting it
- Click the edit icon to update a notice
- Click the trash icon to delete permanently

> Visitors see the popup once per browser session. After they close it, it won't show again until they open a new browser session.

---

## 5. Services (`/admin/services`)

Manage the auto services offered.

**To add a service:**
1. Click **Add Service**
2. Fill in: Name, Description, Price, Duration
3. Upload a service image (optional)
4. Click **Save**

**To edit:** Click the edit icon on any service row.  
**To delete:** Click the delete icon (this removes it from the website immediately).  
**To hide without deleting:** Toggle the **Active** switch off.

---

## 6. Appointments (`/admin/appointments`)

Two views available — toggle between **List** and **Calendar** at the top right.

### List View
Shows all appointments in a table. Filter by status using the buttons at the top.

**To update an appointment status:**
- Use the dropdown in the Actions column
- Statuses: `Pending → Confirmed → Completed → Cancelled`
- When marked **Completed**, the service price is added to revenue

**Click any row** to open a detail modal with full customer and booking info.

### Calendar View
Shows appointments on a monthly calendar. Click any event to open the detail modal.

**Export:** Click **Export Excel** to download all visible appointments as an Excel file.

---

## 7. Products (`/admin/products`)

Manage clothing and merchandise in the shop.

**To add a product:**
1. Click **Add Product**
2. Fill in: Name, Description, Price, Category, Sizes, Colors, Stock
3. Upload product images (you can add multiple)
4. Check **Featured** to show it on the home page
5. Click **Save**

**To edit:** Click the edit icon.  
**To delete:** Click the delete icon.  
**Stock:** Keep stock updated — when stock hits 0, the product shows as out of stock.

---

## 8. Orders (`/admin/orders`)

View all customer orders placed through the shop.

**Order statuses and what they mean:**
| Status | Meaning |
|---|---|
| Pending | Order just placed, not processed yet |
| Processing | You are preparing the order |
| Shipped | Order has been sent out |
| Delivered | Customer received it — **revenue is counted here** |
| Cancelled | Order cancelled — not counted in revenue |

**To update status:** Use the dropdown in the Update column.  
**Customer gets an email** automatically when you change status to Processing, Shipped, Delivered, or Cancelled.

**Click the expand arrow** on any order to see full item details and shipping address.

**Export:** Click **Export Excel** to download orders as an Excel file.

---

## 9. Users (`/admin/users`)

View all registered users. You can:
- See name, email, phone, join date
- Delete a user (this does not delete their orders)
- **Export Excel** to download the full user list

> You cannot edit user passwords from here. Users manage their own passwords via their profile.

---

## 10. Reviews (`/admin/reviews`)

Customer reviews must be approved before they appear on the website.

**To approve a review:** Click the **Approve** button — it will show on the home page.  
**To reject/hide:** Click **Reject** — it stays in the system but is hidden from the site.  
**To delete:** Click the trash icon.

---

## 11. Settings (`/admin/settings`)

### Profile Info
Update your display name and phone number.

### Change Password
1. Enter your current password
2. Enter a new password (min 8 characters, must include a letter and a number)
3. Confirm the new password
4. Click **Update Password**

### Store Currency
Select the currency displayed across the entire website. This changes the currency symbol only — prices in the database are not converted.

---

## Notification System

The **bell icon** in the top right of the admin panel shows live counts:

- 🛒 **Orange pill** — pending orders waiting to be processed
- 📅 **Blue pill** — pending appointments waiting to be confirmed
- ⭐ **Yellow pill** — reviews waiting for approval

Click the bell to see a dropdown with recent activity. Click any item to go directly to that section.

The sidebar nav items also show red badge numbers for pending counts.

Counts refresh automatically every 30 seconds.

---

## Revenue Explained

Revenue is calculated from two sources:

1. **Orders** — only orders with status **Delivered** are counted
2. **Appointments** — only appointments with status **Completed** are counted (uses the service price)

Cancelled orders and appointments are never counted.

The Dashboard shows a breakdown: `Total = Orders Revenue + Services Revenue`

---

## Tips & Best Practices

- **Always click Save** after editing any content page
- **Upload images before saving** — the image URL is generated on upload, not on save
- **Set expiry dates on notices** — promotional offers should expire automatically
- **Export Excel regularly** — keep a backup of orders and appointments
- **Check the bell icon daily** — don't let pending orders or appointments pile up
- **Mark appointments as Completed** after the service is done — this updates revenue
- **Mark orders as Delivered** once confirmed — this updates revenue and emails the customer

---

*Guide version: April 2026 — Everest Auto Hub Admin Panel*
