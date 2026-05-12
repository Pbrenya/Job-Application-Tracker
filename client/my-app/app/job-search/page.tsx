import "./job-search.css";

const jobCards = [
  {
    id: "amazon",
    date: "20 May, 2023",
    company: "Amazon",
    title: "Senior UI/UX Designer",
    location: "San Francisco, CA",
    pay: "$250/hr",
    tags: ["Part time", "Senior level", "Distant", "Project work"],
    tone: "peach",
  },
  {
    id: "google",
    date: "4 Feb, 2023",
    company: "Google",
    title: "Junior UI/UX Designer",
    location: "California, CA",
    pay: "$150/hr",
    tags: ["Full time", "Junior level", "Distant", "Flexible Schedule"],
    tone: "mint",
  },
  {
    id: "dribbble",
    date: "29 Jan, 2023",
    company: "Dribbble",
    title: "Senior Motion Designer",
    location: "New York, NY",
    pay: "$260/hr",
    tags: ["Part time", "Senior level", "Full Day"],
    tone: "lavender",
  },
  {
    id: "twitter",
    date: "11 Apr, 2023",
    company: "Twitter",
    title: "UX Designer",
    location: "California, CA",
    pay: "$120/hr",
    tags: ["Full time", "Middle level", "Distant", "Project work"],
    tone: "sky",
  },
  {
    id: "airbnb",
    date: "2 Apr, 2023",
    company: "Airbnb",
    title: "Graphic Designer",
    location: "New York, NY",
    pay: "$300/hr",
    tags: ["Part time", "Senior level"],
    tone: "rose",
  },
  {
    id: "apple",
    date: "18 Jan, 2023",
    company: "Apple",
    title: "Graphic Designer",
    location: "San Francisco, CA",
    pay: "$140/hr",
    tags: ["Part time", "Distant"],
    tone: "slate",
  },
];

const workingSchedule = [
  "Full time",
  "Part time",
  "Internship",
  "Project work",
  "Volunteering",
];

const employmentType = [
  "Full day",
  "Flexible schedule",
  "Shift work",
  "Distant work",
  "Shift method",
];

export default function JobSearchPage() {
  return (
    <div className="job-ui">
      <div className="job-ui__backdrop" aria-hidden="true" />
      <div className="job-ui__shell">
        <header className="job-ui__topbar">
          <div className="job-ui__brand">
            <span className="job-ui__logo" />
            LuckyJob
          </div>
          <nav className="job-ui__nav">
            {[
              "Find job",
              "Messages",
              "Hiring",
              "Community",
              "FAQ",
            ].map((item, index) => (
              <button
                key={item}
                type="button"
                className={`job-ui__nav-item ${index === 0 ? "is-active" : ""}`}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="job-ui__actions">
            <span className="job-ui__location">New York, NY</span>
            <button type="button" className="job-ui__icon">
              <span className="job-ui__dot" />
            </button>
            <button type="button" className="job-ui__icon">
              <span className="job-ui__dot" />
            </button>
            <div className="job-ui__avatar" />
          </div>
        </header>

        <section className="job-ui__filters" aria-label="Job filters">
          <div className="job-ui__filter">
            <span className="job-ui__filter-icon" />
            <span>Designer</span>
            <span className="job-ui__chevron" />
          </div>
          <div className="job-ui__filter">
            <span className="job-ui__filter-icon" />
            <span>Work location</span>
            <span className="job-ui__chevron" />
          </div>
          <div className="job-ui__filter">
            <span className="job-ui__filter-icon" />
            <span>Experience</span>
            <span className="job-ui__chevron" />
          </div>
          <div className="job-ui__filter">
            <span className="job-ui__filter-icon" />
            <span>Per month</span>
            <span className="job-ui__chevron" />
          </div>
          <div className="job-ui__salary">
            <div className="job-ui__salary-head">
              <span>Salary range</span>
              <strong>$1,200 - $20,000</strong>
            </div>
            <input type="range" min="1" max="100" defaultValue={72} />
          </div>
        </section>

        <div className="job-ui__content">
          <aside className="job-ui__sidebar">
            <div className="job-ui__promo">
              <p>Get your best profession with LuckyJob</p>
              <button type="button">Learn more</button>
            </div>
            <div className="job-ui__filters-panel">
              <div className="job-ui__filters-title">Filters</div>
              <div className="job-ui__filters-group">
                <p>Working schedule</p>
                {workingSchedule.map((item, index) => (
                  <label key={item}>
                    <input type="checkbox" defaultChecked={index < 4} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <div className="job-ui__filters-group">
                <p>Employment type</p>
                {employmentType.map((item, index) => (
                  <label key={item}>
                    <input type="checkbox" defaultChecked={index < 3} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <section className="job-ui__jobs">
            <div className="job-ui__jobs-head">
              <div>
                <h2>Recommended jobs</h2>
                <span>386</span>
              </div>
              <div className="job-ui__sort">
                <span>Sort by:</span>
                <button type="button">Last updated</button>
              </div>
            </div>

            <div className="job-ui__grid">
              {jobCards.map((card, index) => (
                <article
                  key={card.id}
                  className={`job-ui__card job-ui__card--${card.tone}`}
                  style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                >
                  <div className="job-ui__card-top">
                    <span>{card.date}</span>
                    <button type="button" aria-label="Save job">
                      +
                    </button>
                  </div>
                  <div className="job-ui__card-body">
                    <div className="job-ui__card-company">
                      <span>{card.company}</span>
                      <div className="job-ui__card-logo" />
                    </div>
                    <h3>{card.title}</h3>
                    <div className="job-ui__card-tags">
                      {card.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="job-ui__card-foot">
                    <div>
                      <strong>{card.pay}</strong>
                      <span>{card.location}</span>
                    </div>
                    <button type="button">Details</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
