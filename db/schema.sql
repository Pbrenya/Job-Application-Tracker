-- Users table
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  location VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_companies_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Stages table
CREATE TABLE stages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Applications table
CREATE TABLE applications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  company_id CHAR(36) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  description TEXT,
  applied_at DATE,
  stage_id INT NOT NULL,
  salary_min INT,
  salary_max INT,
  job_url VARCHAR(255),
  resume_path VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_applications_stage FOREIGN KEY (stage_id) REFERENCES stages(id)
);

-- Notes table
CREATE TABLE notes (
  id CHAR(36) PRIMARY KEY,
  application_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  note TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_notes_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Pre-populate stages
INSERT INTO stages (name) VALUES ('Applied'), ('Screening'), ('Interview'), ('Offer'), ('Rejected'), ('Hired');
