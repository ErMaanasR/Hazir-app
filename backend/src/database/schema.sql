CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100),
  user_type VARCHAR(20) CHECK (user_type IN ('employer', 'employee')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE otp_verification (
  phone_number VARCHAR(10) PRIMARY KEY,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  base_rate DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employee_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER CHECK (age >= 18 AND age <= 65),
  id_proof_type VARCHAR(50),
  id_proof_url VARCHAR(500),
  hourly_rate DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_jobs INTEGER DEFAULT 0,
  total_hours_worked DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employee_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employee_profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  experience_years INTEGER DEFAULT 0,
  UNIQUE(employee_id, skill_id)
);

CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(100),
  business_type VARCHAR(50),
  subscription_type VARCHAR(20) DEFAULT 'none' CHECK (subscription_type IN ('none', 'monthly', 'yearly')),
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES employer_profiles(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employee_profiles(id) ON DELETE SET NULL,
  skill_id UUID REFERENCES skills(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
  work_description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  rate_per_hour DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_request_id UUID UNIQUE REFERENCES job_requests(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_employee_available ON employee_profiles(is_available);
CREATE INDEX idx_employee_rating ON employee_profiles(rating DESC);
CREATE INDEX idx_job_status ON job_requests(status);
CREATE INDEX idx_job_employer ON job_requests(employer_id);
CREATE INDEX idx_job_employee ON job_requests(employee_id);

INSERT INTO skills (name, base_rate) VALUES
('Electrician', 200.00),
('Plumber', 180.00),
('Carpenter', 220.00),
('Painter', 150.00),
('Cleaner', 120.00),
('Delivery Helper', 100.00),
('Packer', 130.00),
('Store Assistant', 140.00);