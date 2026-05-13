const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const db = require('../db');
const logger = require('../logger');

const STAGES = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
  'Hired',
];

const seedUsers = [
  {
    email: 'demo@jobtrackr.dev',
    password: 'Password123!',
  },
  {
    email: 'samira@jobtrackr.dev',
    password: 'Password123!',
  },
];

const seedCompanies = [
  {
    name: 'Amazon',
    website: 'https://www.amazon.jobs',
    location: 'San Francisco, CA',
  },
  {
    name: 'Google',
    website: 'https://careers.google.com',
    location: 'Mountain View, CA',
  },
  {
    name: 'Dribbble',
    website: 'https://dribbble.com/jobs',
    location: 'New York, NY',
  },
  {
    name: 'Airbnb',
    website: 'https://careers.airbnb.com',
    location: 'New York, NY',
  },
  {
    name: 'Apple',
    website: 'https://jobs.apple.com',
    location: 'Cupertino, CA',
  },
  {
    name: 'Spotify',
    website: 'https://www.lifeatspotify.com',
    location: 'Remote',
  },
  {
    name: 'Meta',
    website: 'https://www.metacareers.com',
    location: 'Menlo Park, CA',
  },
  {
    name: 'Netflix',
    website: 'https://jobs.netflix.com',
    location: 'Los Gatos, CA',
  },
  {
    name: 'Adobe',
    website: 'https://careers.adobe.com',
    location: 'San Jose, CA',
  },
  {
    name: 'Figma',
    website: 'https://www.figma.com/careers',
    location: 'San Francisco, CA',
  },
  {
    name: 'Atlassian',
    website: 'https://www.atlassian.com/company/careers',
    location: 'Sydney, AU',
  },
  {
    name: 'Shopify',
    website: 'https://www.shopify.com/careers',
    location: 'Remote',
  },
  {
    name: 'Microsoft',
    website: 'https://careers.microsoft.com',
    location: 'Redmond, WA',
  },
  {
    name: 'HubSpot',
    website: 'https://www.hubspot.com/careers',
    location: 'Boston, MA',
  },
  {
    name: 'Stripe',
    website: 'https://stripe.com/jobs',
    location: 'Seattle, WA',
  },
  {
    name: 'Notion',
    website: 'https://www.notion.so/careers',
    location: 'San Francisco, CA',
  },
];

const seedApplications = [
  {
    company: 'Amazon',
    job_title: 'Senior UI/UX Designer',
    stage_id: 3,
    applied_at: '2024-02-12',
    salary_min: 120000,
    salary_max: 160000,
    job_url: 'https://www.amazon.jobs/en/jobs/ux-designer',
  },
  {
    company: 'Google',
    job_title: 'Junior Product Designer',
    stage_id: 2,
    applied_at: '2024-02-06',
    salary_min: 90000,
    salary_max: 120000,
    job_url: 'https://careers.google.com/jobs',
  },
  {
    company: 'Dribbble',
    job_title: 'Senior Motion Designer',
    stage_id: 4,
    applied_at: '2024-01-29',
    salary_min: 110000,
    salary_max: 150000,
    job_url: 'https://dribbble.com/jobs',
  },
  {
    company: 'Airbnb',
    job_title: 'Graphic Designer',
    stage_id: 1,
    applied_at: '2024-02-02',
    salary_min: 80000,
    salary_max: 105000,
    job_url: 'https://careers.airbnb.com',
  },
  {
    company: 'Apple',
    job_title: 'Product Designer',
    stage_id: 5,
    applied_at: '2024-01-18',
    salary_min: 130000,
    salary_max: 170000,
    job_url: 'https://jobs.apple.com/en-us/search',
  },
  {
    company: 'Spotify',
    job_title: 'UX Researcher',
    stage_id: 6,
    applied_at: '2023-12-20',
    salary_min: 115000,
    salary_max: 140000,
    job_url: 'https://www.lifeatspotify.com/jobs',
  },
  {
    company: 'Google',
    job_title: 'Design Systems Specialist',
    stage_id: 2,
    applied_at: '2024-02-20',
    salary_min: 100000,
    salary_max: 145000,
    job_url: 'https://careers.google.com/jobs',
  },
  {
    company: 'Amazon',
    job_title: 'UX Designer',
    stage_id: 3,
    applied_at: '2024-02-25',
    salary_min: 95000,
    salary_max: 125000,
    job_url: 'https://www.amazon.jobs/en/jobs/ux-designer',
  },
  {
    company: 'Airbnb',
    job_title: 'Brand Designer',
    stage_id: 1,
    applied_at: '2024-02-10',
    salary_min: 85000,
    salary_max: 115000,
    job_url: 'https://careers.airbnb.com',
  },
  {
    company: 'Apple',
    job_title: 'Interaction Designer',
    stage_id: 4,
    applied_at: '2024-03-01',
    salary_min: 125000,
    salary_max: 165000,
    job_url: 'https://jobs.apple.com/en-us/search',
  },
  {
    company: 'Meta',
    job_title: 'Product Designer II',
    stage_id: 2,
    applied_at: '2024-03-08',
    salary_min: 130000,
    salary_max: 175000,
    job_url: 'https://www.metacareers.com',
  },
  {
    company: 'Netflix',
    job_title: 'UX/UI Designer',
    stage_id: 3,
    applied_at: '2024-03-12',
    salary_min: 140000,
    salary_max: 185000,
    job_url: 'https://jobs.netflix.com',
  },
  {
    company: 'Adobe',
    job_title: 'Visual Designer',
    stage_id: 1,
    applied_at: '2024-03-05',
    salary_min: 105000,
    salary_max: 135000,
    job_url: 'https://careers.adobe.com',
  },
  {
    company: 'Figma',
    job_title: 'Design Systems Lead',
    stage_id: 4,
    applied_at: '2024-03-18',
    salary_min: 145000,
    salary_max: 190000,
    job_url: 'https://www.figma.com/careers',
  },
  {
    company: 'Atlassian',
    job_title: 'Senior Product Designer',
    stage_id: 2,
    applied_at: '2024-02-28',
    salary_min: 120000,
    salary_max: 155000,
    job_url: 'https://www.atlassian.com/company/careers',
  },
  {
    company: 'Shopify',
    job_title: 'UX Researcher',
    stage_id: 3,
    applied_at: '2024-01-22',
    salary_min: 110000,
    salary_max: 145000,
    job_url: 'https://www.shopify.com/careers',
  },
  {
    company: 'Microsoft',
    job_title: 'Interaction Designer II',
    stage_id: 5,
    applied_at: '2024-02-14',
    salary_min: 135000,
    salary_max: 175000,
    job_url: 'https://careers.microsoft.com',
  },
  {
    company: 'HubSpot',
    job_title: 'Content Designer',
    stage_id: 1,
    applied_at: '2024-03-03',
    salary_min: 90000,
    salary_max: 120000,
    job_url: 'https://www.hubspot.com/careers',
  },
  {
    company: 'Stripe',
    job_title: 'Product Designer',
    stage_id: 4,
    applied_at: '2024-03-22',
    salary_min: 150000,
    salary_max: 195000,
    job_url: 'https://stripe.com/jobs',
  },
  {
    company: 'Notion',
    job_title: 'Brand Designer',
    stage_id: 2,
    applied_at: '2024-03-10',
    salary_min: 115000,
    salary_max: 150000,
    job_url: 'https://www.notion.so/careers',
  },
  {
    company: 'Meta',
    job_title: 'Design Program Manager',
    stage_id: 1,
    applied_at: '2024-02-01',
    salary_min: 125000,
    salary_max: 160000,
    job_url: 'https://www.metacareers.com',
  },
  {
    company: 'Figma',
    job_title: 'Senior UX Writer',
    stage_id: 3,
    applied_at: '2024-02-17',
    salary_min: 120000,
    salary_max: 155000,
    job_url: 'https://www.figma.com/careers',
  },
  {
    company: 'Adobe',
    job_title: 'Product Design Manager',
    stage_id: 6,
    applied_at: '2023-12-05',
    salary_min: 150000,
    salary_max: 190000,
    job_url: 'https://careers.adobe.com',
  },
  {
    company: 'Stripe',
    job_title: 'Design Systems Designer',
    stage_id: 2,
    applied_at: '2024-01-11',
    salary_min: 140000,
    salary_max: 180000,
    job_url: 'https://stripe.com/jobs',
  },
  {
    company: 'Microsoft',
    job_title: 'Service Designer',
    stage_id: 3,
    applied_at: '2024-03-02',
    salary_min: 120000,
    salary_max: 160000,
    job_url: 'https://careers.microsoft.com',
  },
  {
    company: 'Shopify',
    job_title: 'Visual Design Lead',
    stage_id: 4,
    applied_at: '2024-02-21',
    salary_min: 130000,
    salary_max: 165000,
    job_url: 'https://www.shopify.com/careers',
  },
];

const seedNotes = [
  'Recruiter replied. Schedule phone screen.',
  'Portfolio update requested.',
  'Follow up sent after interview.',
  'Waiting on feedback from hiring manager.',
  'Prepare case study walkthrough.',
  'Received take-home assignment.',
  'Asked for salary expectations.',
  'Second round scheduled next week.',
  'Sent thank-you email after interview.',
  'Need to update resume for this role.',
  'Waiting on recruiter to confirm timeline.',
  'Panel interview completed.',
];

const ensureStages = async () => {
  for (const name of STAGES) {
    await db.query('INSERT IGNORE INTO stages (name) VALUES (?)', [name]);
  }
};

const findUserByEmail = async (email) => {
  const result = await db.query('SELECT id, email FROM users WHERE email = ?', [
    email,
  ]);
  return result.recordset[0];
};

const ensureUser = async (email, password) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    return existing.id;
  }

  const id = randomUUID();
  const password_hash = await bcrypt.hash(password, 12);
  await db.query(
    `INSERT INTO users (id, email, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, NOW(), NOW())`,
    [id, email, password_hash]
  );
  return id;
};

const findCompany = async (userId, name) => {
  const result = await db.query(
    'SELECT id FROM companies WHERE user_id = ? AND name = ? AND is_deleted = 0',
    [userId, name]
  );
  return result.recordset[0];
};

const ensureCompany = async (userId, company) => {
  const existing = await findCompany(userId, company.name);
  if (existing) {
    return existing.id;
  }

  const id = randomUUID();
  await db.query(
    `INSERT INTO companies (id, user_id, name, website, location, created_at, updated_at, is_deleted)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW(), 0)`,
    [id, userId, company.name, company.website, company.location]
  );
  return id;
};

const findApplication = async (userId, companyId, jobTitle) => {
  const result = await db.query(
    `SELECT id FROM applications
     WHERE user_id = ? AND company_id = ? AND job_title = ? AND deleted_at IS NULL`,
    [userId, companyId, jobTitle]
  );
  return result.recordset[0];
};

const ensureApplication = async (userId, companyId, application) => {
  const existing = await findApplication(userId, companyId, application.job_title);
  if (existing) {
    return existing.id;
  }

  const id = randomUUID();
  await db.query(
    `INSERT INTO applications (
        id,
        user_id,
        company_id,
        job_title,
        description,
        applied_at,
        stage_id,
        salary_min,
        salary_max,
        job_url,
        resume_path,
        created_at,
        updated_at,
        deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NULL)`,
    [
      id,
      userId,
      companyId,
      application.job_title,
      application.description || null,
      application.applied_at || null,
      application.stage_id,
      application.salary_min ?? null,
      application.salary_max ?? null,
      application.job_url || null,
      null,
    ]
  );
  return id;
};

const ensureNote = async (userId, applicationId, note) => {
  const existing = await db.query(
    `SELECT id FROM notes
     WHERE application_id = ? AND user_id = ? AND note = ? AND is_deleted = 0`,
    [applicationId, userId, note]
  );
  if (existing.recordset[0]) {
    return existing.recordset[0].id;
  }

  const id = randomUUID();
  await db.query(
    `INSERT INTO notes (id, application_id, user_id, note, created_at, updated_at, is_deleted)
     VALUES (?, ?, ?, ?, NOW(), NOW(), 0)`,
    [id, applicationId, userId, note]
  );
  return id;
};

const seed = async () => {
  await ensureStages();

  const userIds = [];
  for (const user of seedUsers) {
    const id = await ensureUser(user.email, user.password);
    userIds.push(id);
  }

  const primaryUserId = userIds[0];
  const companyIds = {};
  for (const company of seedCompanies) {
    companyIds[company.name] = await ensureCompany(primaryUserId, company);
  }

  const applicationIds = [];
  for (const application of seedApplications) {
    const companyId = companyIds[application.company];
    if (!companyId) {
      continue;
    }
    const id = await ensureApplication(primaryUserId, companyId, application);
    applicationIds.push(id);
  }

  for (let index = 0; index < applicationIds.length; index += 1) {
    const applicationId = applicationIds[index];
    const note = seedNotes[index % seedNotes.length];
    const followUpNote = seedNotes[(index + 5) % seedNotes.length];
    await ensureNote(primaryUserId, applicationId, note);
    await ensureNote(primaryUserId, applicationId, followUpNote);
  }

  logger.info('Seed data added.');
  return {
    users: userIds.length,
    companies: Object.keys(companyIds).length,
    applications: applicationIds.length,
  };
};

seed()
  .then((summary) => {
    console.log('Seed complete:', summary);
    return db.disconnect();
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    db.disconnect().catch(() => undefined);
    process.exitCode = 1;
  });
