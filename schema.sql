-- ElevateHours Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: TIER REFERENCE
-- ============================================
CREATE TABLE tier_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tier_name TEXT NOT NULL,
  description TEXT,
  multiplier DECIMAL(3,1) NOT NULL,
  work_sparks_per_hour INTEGER NOT NULL,
  education_sparks_per_hour INTEGER NOT NULL,
  example_tasks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert tier data
INSERT INTO tier_reference (tier_name, description, multiplier, work_sparks_per_hour, education_sparks_per_hour, example_tasks) VALUES
('Tier 1: Foundational', 'Entry level tasks requiring minimal skill', 1.5, 150, 90, 'Data entry, transcription, admin, basic research'),
('Tier 2: Specialized', 'Skilled tasks requiring trained ability', 2.0, 200, 120, 'Graphic design, copywriting, social media, bookkeeping'),
('Tier 3: Strategic', 'Expert level tasks requiring deep expertise', 3.0, 300, 180, 'Full stack coding, financial audits, strategic planning');

-- ============================================
-- TABLE 2: SKILLS CATALOG
-- ============================================
CREATE TABLE skills_catalog (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  skill_name TEXT NOT NULL,
  track TEXT CHECK (track IN ('Work', 'Education')) NOT NULL,
  tier_id UUID REFERENCES tier_reference(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert Work Skills - Tier 1
INSERT INTO skills_catalog (skill_name, track, tier_id) 
SELECT skill, 'Work', id FROM tier_reference, unnest(ARRAY[
  'Data Entry','Basic Research','Transcription','Proofreading','Email Management',
  'Scheduling','File Organization','Basic Data Cleaning','Content Moderation',
  'Social Media Posting','Basic Customer Support','Survey Administration',
  'Meeting Note Taking','Basic Translation','Inventory Tracking','Copy Paste Tasks',
  'Basic Photo Editing','Product Listing','Basic Spreadsheet Work','Forum Moderation',
  'Receipt Processing','Basic HTML Edits','Directory Submissions','Subtitle Adding',
  'Basic Presentation Formatting','Online Form Filling','Database Updating',
  'Basic Report Formatting','Simple Data Collection','Virtual Assistant Tasks'
]) AS skill WHERE tier_name = 'Tier 1: Foundational';

-- Insert Work Skills - Tier 2
INSERT INTO skills_catalog (skill_name, track, tier_id)
SELECT skill, 'Work', id FROM tier_reference, unnest(ARRAY[
  'Graphic Design','Copywriting','Content Writing','Social Media Management',
  'Video Editing','Basic Bookkeeping','UI/UX Design','Photography','Email Marketing',
  'SEO Optimization','Event Planning','Basic Market Research','Grant Proposal Writing',
  'HR/Recruitment Support','Podcast Production','Public Relations','Branding',
  'No-Code Web Design','Illustration','Audio Editing','Motion Graphics',
  'Newsletter Design','Infographic Design','Script Writing','Community Management',
  'Influencer Outreach','Basic App Testing','Professional Translation',
  'Presentation Design','E-commerce Management','Recruitment Screening',
  'Press Release Writing','Social Media Advertising','Basic Financial Reporting',
  'Website Content Writing','YouTube Channel Management','Basic Data Analysis',
  'Customer Journey Mapping','Training Material Design','Digital Marketing Campaigns'
]) AS skill WHERE tier_name = 'Tier 2: Specialized';

-- Insert Work Skills - Tier 3
INSERT INTO skills_catalog (skill_name, track, tier_id)
SELECT skill, 'Work', id FROM tier_reference, unnest(ARRAY[
  'Full Stack Development','Database Architecture','Financial Modeling',
  'Financial Auditing','Strategic Business Planning','Data Science and Analytics',
  'Machine Learning and AI','Cybersecurity','Legal Counsel','Fundraising Strategy',
  'Product Management','Organizational Strategy','Impact Measurement',
  'Technical Architecture','Advanced Market Analysis','Board Advisory',
  'Complex Grant Writing','M&A Advisory','Blockchain Development','Cloud Infrastructure',
  'DevOps Engineering','Mobile App Development','Investment Analysis','Business Valuation',
  'Policy Development','Risk Management','Change Management','Corporate Governance',
  'Advanced SEO Strategy','Growth Hacking','CTO Advisory','CFO Advisory',
  'Venture Capital Strategy','Public Speaking Coaching','Crisis Management',
  'International Expansion Strategy','Mergers Integration','IP Strategy',
  'Regulatory Compliance','Systems Integration'
]) AS skill WHERE tier_name = 'Tier 3: Strategic';

-- Insert Education Skills - Tier 1
INSERT INTO skills_catalog (skill_name, track, tier_id)
SELECT skill, 'Education', id FROM tier_reference, unnest(ARRAY[
  'Basic Mathematics Tutoring','English Language Basics','Basic Computer Skills',
  'MS Office Training','Basic Reading and Writing Support','Study Skills Coaching',
  'Basic Science Tutoring','Geography Tutoring','History Tutoring','Basic Typing Skills',
  'Introduction to Internet','Basic Email Usage','Basic Coding Introduction',
  'Basic Drawing Lessons','Basic Music Theory','Introduction to Photography',
  'Basic Cooking Skills','Time Management Basics','Basic Financial Literacy',
  'Introduction to Public Speaking','Basic Social Media Usage','Introduction to Design Tools',
  'Basic Research Skills','Introduction to Freelancing','Basic CV Writing Help',
  'Introduction to Entrepreneurship','Basic Accounting Concepts','Introduction to Marketing',
  'Basic Language Learning Support','Introduction to Project Management'
]) AS skill WHERE tier_name = 'Tier 1: Foundational';

-- Insert Education Skills - Tier 2
INSERT INTO skills_catalog (skill_name, track, tier_id)
SELECT skill, 'Education', id FROM tier_reference, unnest(ARRAY[
  'Python Programming Basics','JavaScript Fundamentals','Graphic Design Training',
  'Video Editing Workshops','Social Media Marketing Course','SEO Training',
  'Content Writing Course','Photography Masterclass','UI/UX Design Training',
  'Digital Marketing Workshop','Data Analysis Training','Excel Advanced Training',
  'Canva Design Training','Copywriting Course','Email Marketing Training',
  'Basic Financial Modeling','Podcast Creation Workshop','Career Coaching Sessions',
  'Personal Branding Workshop','LinkedIn Profile Optimization',
  'Entrepreneurship Fundamentals','Business Plan Writing Workshop',
  'Basic Investment Concepts','Negotiation Skills Training','Leadership Fundamentals',
  'Public Speaking Workshop','Sales Skills Training','Customer Service Excellence',
  'Project Management Basics','Productivity Systems Training',
  'Foreign Language Intermediate','Mindfulness and Focus Training',
  'Presentation Skills Workshop','Research Methodology Training','Grant Writing Basics',
  'Nonprofit Management Basics','Event Management Training','Community Building Workshop',
  'E-commerce Basics','Freelancing Success Workshop'
]) AS skill WHERE tier_name = 'Tier 2: Specialized';

-- Insert Education Skills - Tier 3
INSERT INTO skills_catalog (skill_name, track, tier_id)
SELECT skill, 'Education', id FROM tier_reference, unnest(ARRAY[
  'Advanced Full Stack Development Mentorship','Data Science Mentorship',
  'Machine Learning Training','Cybersecurity Professional Training',
  'Financial Audit Training','Strategic Business Mentorship',
  'Investment and Venture Capital Masterclass','Advanced Financial Modeling',
  'Legal Practice Guidance','Executive Leadership Coaching',
  'Product Management Masterclass','Advanced Data Analytics',
  'Blockchain Technology Training','Cloud Computing Advanced',
  'DevOps Professional Training','Advanced Digital Marketing Strategy',
  'Growth Hacking Masterclass','Corporate Governance Training',
  'Advanced Public Speaking Coaching','Crisis Management Training',
  'Advanced Negotiation Masterclass','Organizational Development Coaching',
  'Impact Investing Mentorship','Advanced Grant Writing Masterclass',
  'International Business Strategy','Mergers and Acquisitions Training',
  'Risk Management Professional Course','Change Management Masterclass',
  'IP and Patent Strategy Training','Regulatory Compliance Training',
  'CTO Mentorship Program','CFO Mentorship Program',
  'Advanced Product Design Mentorship','Startup Scaling Strategy',
  'Social Enterprise Development','Policy Development Workshop',
  'Systems Thinking Masterclass','Advanced Research Methodology',
  'Nonprofit Scaling Strategy','Executive Decision Making Masterclass'
]) AS skill WHERE tier_name = 'Tier 3: Strategic';

-- ============================================
-- TABLE 3: PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  account_type TEXT CHECK (account_type IN ('Personal', 'Organization')) NOT NULL,
  bio TEXT,
  tier_level TEXT DEFAULT 'Tier 1: Foundational',
  impact_score INTEGER DEFAULT 0,
  sparks_earned INTEGER DEFAULT 0,
  sparks_spent INTEGER DEFAULT 0,
  sparks_purchased_total INTEGER DEFAULT 0,
  active_gifts_received INTEGER DEFAULT 0,
  completed_transactions INTEGER DEFAULT 0,
  organization_trust_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Computed columns as functions
CREATE OR REPLACE FUNCTION get_permanent_balance(p profiles)
RETURNS INTEGER AS $$
  SELECT p.sparks_earned - p.sparks_spent + p.sparks_purchased_total;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION get_total_usable_balance(p profiles)
RETURNS INTEGER AS $$
  SELECT (p.sparks_earned - p.sparks_spent + p.sparks_purchased_total) + p.active_gifts_received;
$$ LANGUAGE SQL STABLE;

-- Profile skills junction tables
CREATE TABLE profile_skills_offered (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills_catalog(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, skill_id)
);

CREATE TABLE profile_skills_needed (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills_catalog(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, skill_id)
);

-- ============================================
-- TABLE 4: TRANSACTIONS
-- ============================================
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  skill_id UUID REFERENCES skills_catalog(id),
  tier_id UUID REFERENCES tier_reference(id),
  track TEXT CHECK (track IN ('Work', 'Education')) NOT NULL,
  hours_contributed DECIMAL(5,1),
  agreed_hours DECIMAL(5,1),
  total_sparks_transferred INTEGER,
  description TEXT,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Pending Confirmation','Confirmed','Disputed','Cancelled')),
  date DATE DEFAULT CURRENT_DATE,
  provider_rating INTEGER CHECK (provider_rating BETWEEN 1 AND 5),
  receiver_rating INTEGER CHECK (receiver_rating BETWEEN 1 AND 5),
  experience_letter_issued BOOLEAN DEFAULT FALSE,
  certificate_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLE 5: FUNDING REQUESTS
-- ============================================
CREATE TABLE funding_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) NOT NULL,
  requester_name TEXT NOT NULL,
  amount_requested INTEGER NOT NULL CHECK (amount_requested <= 2000),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open','Fulfilled','Expired')),
  date_requested DATE DEFAULT CURRENT_DATE,
  expiry_date DATE GENERATED ALWAYS AS (date_requested + INTERVAL '7 days') STORED,
  amount_funded_so_far INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLE 6: GIFTS
-- ============================================
CREATE TABLE gifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID REFERENCES profiles(id) NOT NULL,
  funding_request_id UUID REFERENCES funding_requests(id) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 100),
  date_given DATE DEFAULT CURRENT_DATE,
  expiry_date DATE GENERATED ALWAYS AS (date_given + INTERVAL '30 days') STORED,
  status TEXT GENERATED ALWAYS AS (
    CASE WHEN date_given + INTERVAL '30 days' < CURRENT_DATE THEN 'Expired' ELSE 'Active' END
  ) STORED,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLE 7: SPARK PURCHASES
-- ============================================
CREATE TABLE spark_purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  purchase_type TEXT CHECK (purchase_type IN ('Fixed Rate','Bundle')) NOT NULL,
  bundle TEXT CHECK (bundle IN ('Starter','Growth','Pro','Impact')),
  sparks_purchased INTEGER NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  date_purchased DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLE 8: BADGES
-- ============================================
CREATE TABLE badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  badge_name TEXT NOT NULL,
  description TEXT,
  skill_id UUID REFERENCES skills_catalog(id),
  tier_required_id UUID REFERENCES tier_reference(id),
  sparks_required INTEGER NOT NULL,
  badge_type TEXT CHECK (badge_type IN ('Skill Badge','Achievement Badge','Impact Badge')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  date_awarded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLE 9: ENDORSEMENTS
-- ============================================
CREATE TABLE endorsements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  endorser_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  skill_id UUID REFERENCES skills_catalog(id),
  endorsement_text TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  track TEXT CHECK (track IN ('Work','Education')),
  date_given DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Transactions viewable by everyone" ON transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update transactions they are part of" ON transactions FOR UPDATE USING (auth.uid() = provider_id OR auth.uid() = receiver_id);

-- Funding requests policies
CREATE POLICY "Funding requests viewable by everyone" ON funding_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create funding requests" ON funding_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Requesters can update their own requests" ON funding_requests FOR UPDATE USING (auth.uid() = requester_id);

-- Gifts policies
CREATE POLICY "Gifts viewable by everyone" ON gifts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create gifts" ON gifts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Spark purchases policies
CREATE POLICY "Users can view their own purchases" ON spark_purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Authenticated users can create purchases" ON spark_purchases FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Endorsements policies
CREATE POLICY "Endorsements viewable by everyone" ON endorsements FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create endorsements" ON endorsements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User badges policies
CREATE POLICY "User badges viewable by everyone" ON user_badges FOR SELECT USING (true);

-- Skills and tiers are public read
ALTER TABLE tier_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tier reference is public" ON tier_reference FOR SELECT USING (true);
CREATE POLICY "Skills catalog is public" ON skills_catalog FOR SELECT USING (true);
CREATE POLICY "Badges are public" ON badges FOR SELECT USING (true);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'Personal')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TRIGGER: Update funding request amount_funded_so_far
-- ============================================
CREATE OR REPLACE FUNCTION update_funding_request_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE funding_requests
  SET amount_funded_so_far = (
    SELECT COALESCE(SUM(amount), 0)
    FROM gifts
    WHERE funding_request_id = NEW.funding_request_id
  )
  WHERE id = NEW.funding_request_id;
  
  -- Update recipient's active_gifts_received
  UPDATE profiles
  SET active_gifts_received = (
    SELECT COALESCE(SUM(g.amount), 0)
    FROM gifts g
    JOIN funding_requests fr ON g.funding_request_id = fr.id
    WHERE fr.requester_id = profiles.id
    AND g.date_given + INTERVAL '30 days' >= CURRENT_DATE
  )
  WHERE id = (SELECT requester_id FROM funding_requests WHERE id = NEW.funding_request_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_gift_created
  AFTER INSERT ON gifts
  FOR EACH ROW EXECUTE FUNCTION update_funding_request_total();

-- ============================================
-- TRIGGER: Update profile balances on transaction confirmed
-- ============================================
CREATE OR REPLACE FUNCTION update_profile_balances()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Confirmed' AND OLD.status != 'Confirmed' THEN
    -- Update provider sparks earned
    UPDATE profiles
    SET sparks_earned = sparks_earned + NEW.total_sparks_transferred,
        completed_transactions = completed_transactions + 1
    WHERE id = NEW.provider_id;
    
    -- Update receiver sparks spent
    UPDATE profiles
    SET sparks_spent = sparks_spent + NEW.total_sparks_transferred
    WHERE id = NEW.receiver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_confirmed
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_profile_balances();

-- ============================================
-- TRIGGER: Update profile sparks_purchased_total
-- ============================================
CREATE OR REPLACE FUNCTION update_sparks_purchased()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET sparks_purchased_total = sparks_purchased_total + NEW.sparks_purchased
  WHERE id = NEW.buyer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_spark_purchase
  AFTER INSERT ON spark_purchases
  FOR EACH ROW EXECUTE FUNCTION update_sparks_purchased();
