# Hazir Database Schema

## Overview
PostgreSQL database using UUID primary keys and foreign key relationships.

## Tables

### users
Main authentication table for both employers and employees.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| phone_number | VARCHAR(10) | Unique login credential |
| name | VARCHAR(100) | User's full name |
| user_type | VARCHAR(20) | 'employer' or 'employee' |
| is_verified | BOOLEAN | Phone verified via OTP |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

### otp_verification
Temporary OTP storage for phone verification.

| Column | Type | Description |
|--------|------|-------------|
| phone_number | VARCHAR(10) | Primary key |
| otp | VARCHAR(6) | 6-digit OTP code |
| expires_at | TIMESTAMP | OTP expiry (5 minutes) |
| created_at | TIMESTAMP | OTP generation time |

### skills
Master list of available job skills.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(50) | Skill name (unique) |
| base_rate | DECIMAL(10,2) | Default hourly rate in INR |
| created_at | TIMESTAMP | Record creation time |

**Pre-populated skills:**
- Electrician (200/hr)
- Plumber (180/hr)
- Carpenter (220/hr)
- Painter (150/hr)
- Cleaner (120/hr)
- Delivery Helper (100/hr)
- Packer (130/hr)
- Store Assistant (140/hr)

### employee_profiles
Extended profile for employee users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| age | INTEGER | Must be 18-65 |
| id_proof_type | VARCHAR(50) | Type of ID (Aadhaar, PAN, etc) |
| id_proof_url | VARCHAR(500) | Stored document URL |
| hourly_rate | DECIMAL(10,2) | Current hourly rate |
| rating | DECIMAL(3,2) | Average rating (0-5) |
| total_jobs | INTEGER | Jobs completed count |
| total_hours_worked | DECIMAL(10,2) | Lifetime hours |
| is_available | BOOLEAN | Can accept jobs |

### employee_skills
Many-to-many relationship between employees and skills.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employee_profiles |
| skill_id | UUID | Foreign key to skills |
| experience_years | INTEGER | Self-reported experience |

### employer_profiles
Extended profile for employer users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| business_name | VARCHAR(100) | Shop/business name |
| business_type | VARCHAR(50) | Type of business |
| subscription_type | VARCHAR(20) | 'none', 'monthly', 'yearly' |
| subscription_expires_at | TIMESTAMP | Subscription end date |

### job_requests
Core transaction table tracking all jobs.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employer_id | UUID | Foreign key to employer_profiles |
| employee_id | UUID | Foreign key to employee_profiles |
| skill_id | UUID | Foreign key to skills |
| status | VARCHAR(20) | Job status (see workflow below) |
| work_description | TEXT | Job details |
| start_time | TIMESTAMP | Scheduled start |
| end_time | TIMESTAMP | Scheduled end |
| estimated_hours | DECIMAL(5,2) | Expected duration |
| actual_hours | DECIMAL(5,2) | Actual duration |
| rate_per_hour | DECIMAL(10,2) | Agreed rate |
| total_amount | DECIMAL(10,2) | Final payment |

**Status workflow:**
```
pending → accepted → in_progress → completed
   ↓         ↓
rejected  cancelled
```

### ratings
One rating per completed job.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_request_id | UUID | Foreign key to job_requests (unique) |
| rating | INTEGER | 1-5 stars |
| review | TEXT | Optional text review |
| created_at | TIMESTAMP | Rating submission time |

## Relationships
```
users (1) ─→ (1) employee_profiles
                    ↓
              employee_skills (many)
                    ↓
              skills (many)

users (1) ─→ (1) employer_profiles
                    ↓
              job_requests (many)
                    ↓
              ratings (0..1)

employee_profiles (1) ─→ job_requests (many)
```

## Indexes

Performance indexes created on:
- users.phone_number
- users.user_type
- employee_profiles.is_available
- employee_profiles.rating (descending)
- job_requests.status
- job_requests.employer_id
- job_requests.employee_id