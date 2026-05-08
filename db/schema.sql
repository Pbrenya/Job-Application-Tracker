-- Users table
CREATE TABLE users (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  email NVARCHAR(255) UNIQUE NOT NULL,
  password_hash NVARCHAR(MAX) NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE()
);

-- Companies table
CREATE TABLE companies (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
  name NVARCHAR(255) NOT NULL,
  website NVARCHAR(255),
  location NVARCHAR(255),
  created_at DATETIME2 DEFAULT GETDATE()
);

-- Stages table
CREATE TABLE stages (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL UNIQUE
);

-- Applications table
CREATE TABLE applications (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
  company_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES companies(id),
  job_title NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  applied_at DATE,
  stage_id INT NOT NULL FOREIGN KEY REFERENCES stages(id),
  salary_min INT,
  salary_max INT,
  job_url NVARCHAR(MAX),
  created_at DATETIME2 DEFAULT GETDATE(),
  deleted_at DATETIME2
);

-- Contacts table
CREATE TABLE contacts (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  company_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES companies(id) ON DELETE CASCADE,
  name NVARCHAR(255) NOT NULL,
  title NVARCHAR(255),
  email NVARCHAR(255),
  phone VARCHAR(50),
  linkedin_url NVARCHAR(MAX)
);

-- Notes table
CREATE TABLE notes (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  application_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES applications(id) ON DELETE CASCADE,
  note NVARCHAR(MAX) NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE()
);

-- Pre-populate stages
INSERT INTO stages (name) VALUES ('Applied'), ('Phone Screen'), ('Technical'), ('Offer'), ('Rejected');
