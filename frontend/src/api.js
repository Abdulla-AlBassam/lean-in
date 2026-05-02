const MOCK = true;
const BACKEND_URL = "http://localhost:8000";

export async function search(query, nation) {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 220));
    const person = findPerson(query);
    if (person) return mockPersonResult(person, nation);
    return mockTopicResult(query, nation);
  }
  const url = `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}&nation=${nation}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

export async function getPerson(id) {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    const person = MOCK_PEOPLE[id];
    if (!person) throw new Error("Person not found");
    return { person, results: person.results };
  }
  const r = await fetch(`${BACKEND_URL}/api/person/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

export function getPartyMps(partyId) {
  return PARTY_MPS[partyId] || [];
}

export function getMp(mpId) {
  return MOCK_PEOPLE[mpId] || null;
}

export function getMpTopicPositions(mpId, axisId) {
  return (MP_POSITIONS[mpId] && MP_POSITIONS[mpId][axisId]) || [];
}

export function getArticles(axisId, partyId) {
  return (ARTICLES[axisId] && ARTICLES[axisId][partyId]) || [];
}

export function getMpScores(mpId) {
  return MP_SCORES[mpId] || null;
}

const PARTY_META = {
  labour:       { name: "Labour",            colour: "#E4003B" },
  conservative: { name: "Conservative",      colour: "#0087DC" },
  libdem:       { name: "Liberal Democrats", colour: "#FAA61A" },
  snp:          { name: "SNP",               colour: "#FDF38E" },
};
const NATION_PARTIES = {
  UK:  ["labour", "conservative", "libdem"],
  ENG: ["labour", "conservative", "libdem"],
  SCO: ["labour", "conservative", "libdem", "snp"],
  WAL: ["labour", "conservative", "libdem"],
};

const TOPIC_KEYWORDS = {
  housing:     ["rent", "housing", "renter", "landlord", "evict", "homeless", "mortgage"],
  education:   ["tuition", "student", "university", "school", "education", "loan"],
  health:      ["nhs", "health", "hospital", "doctor", "waiting", "social care"],
  immigration: ["immigration", "border", "asylum", "refugee", "visa", "migrant"],
  environment: ["climate", "environment", "green", "energy", "emissions", "net zero"],
  economy:     ["tax", "economy", "wages", "inflation", "growth", "deficit", "spending"],
};

function detectAxis(query) {
  const q = query.toLowerCase();
  for (const [axis, kws] of Object.entries(TOPIC_KEYWORDS)) {
    if (kws.some((kw) => q.includes(kw))) return axis;
  }
  return "housing";
}

const TOPIC_DATA = {
  housing: {
    label: "Housing & Renting",
    summaries: {
      labour:       "Labour proposes ending no-fault evictions and capping rent rises tied to inflation.",
      conservative: "Conservatives back balanced reform that protects landlords alongside renters, with stamp-duty relief for first-time landlords.",
      libdem:       "Lib Dems want a national landlord register and an outright ban on no-fault evictions.",
      snp:          "The SNP commits Scotland to renter protections that go beyond Westminster.",
    },
    timelines: {
      labour: [
        { type: "manifesto", date: "2024-06-13", headline: "Manifesto pledge: end Section 21 no-fault evictions", quote: "We will end no-fault evictions and cap rent increases.", source_label: "Labour Manifesto 2024, p.34", source_url: "https://labour.org.uk/manifesto-2024/" },
      ],
      conservative: [
        { type: "manifesto", date: "2024-06-11", headline: "Balanced reform of the rental market", quote: "We will support landlords and renters through fair, balanced reform.", source_label: "Conservative Manifesto 2024, p.21", source_url: "https://conservatives.com/manifesto-2024/" },
      ],
      libdem: [
        { type: "manifesto", date: "2024-06-10", headline: "National register of landlords", quote: "We will introduce a national register of landlords and ban no-fault evictions.", source_label: "Lib Dem Manifesto 2024, p.18", source_url: "https://libdems.org.uk/manifesto-2024" },
      ],
      snp: [
        { type: "manifesto", date: "2024-06-19", headline: "Stronger renters' protections than Westminster", quote: "Scotland will lead with stronger renters' protections than Westminster.", source_label: "SNP Manifesto 2024, p.12", source_url: "https://snp.org/manifesto-2024" },
      ],
    },
  },
  education: {
    label: "Education & Universities",
    summaries: {
      labour:       "Labour pledges to reform student finance with a more progressive contribution model and reverse cuts to higher education.",
      conservative: "Conservatives focus on apprenticeships, lifetime skills funding, and protecting universities' autonomy.",
      libdem:       "Lib Dems propose restoring maintenance grants and reviewing the tuition-fee system.",
      snp:          "The SNP guarantees free university tuition for Scottish students and expanded student support.",
    },
    timelines: {
      labour: [
        { type: "manifesto", date: "2024-06-13", headline: "Manifesto: reform tuition fees", quote: "We will reform tuition fees and tackle student debt for working-class graduates.", source_label: "Labour Manifesto 2024, p.62", source_url: "https://labour.org.uk/manifesto-2024/" },
      ],
      conservative: [
        { type: "manifesto", date: "2024-06-11", headline: "Apprenticeships and skills training", quote: "We will expand apprenticeships and back high-quality skills training.", source_label: "Conservative Manifesto 2024, p.40", source_url: "https://conservatives.com/manifesto-2024/" },
      ],
      libdem: [
        { type: "manifesto", date: "2024-06-10", headline: "Restore maintenance grants", quote: "We will restore maintenance grants and review the entire tuition fees system.", source_label: "Lib Dem Manifesto 2024, p.27", source_url: "https://libdems.org.uk/manifesto-2024" },
      ],
      snp: [
        { type: "manifesto", date: "2024-06-19", headline: "Free tuition for Scottish students", quote: "Scotland will keep university tuition free for Scottish students.", source_label: "SNP Manifesto 2024, p.18", source_url: "https://snp.org/manifesto-2024" },
      ],
    },
  },
  health: {
    label: "Health & NHS",
    summaries: {
      labour:       "Labour pledges to cut NHS waiting times with extra appointments and reformed primary care.",
      conservative: "Conservatives commit to year-on-year NHS funding rises and digital-first appointments.",
      libdem:       "Lib Dems would guarantee a GP appointment within seven days and reverse social-care cuts.",
      snp:          "The SNP defends free prescriptions and guarantees Scottish NHS pay rises in line with inflation.",
    },
    timelines: {
      labour: [
        { type: "manifesto", date: "2024-06-13", headline: "40,000 extra appointments a week", quote: "We will deliver an extra 40,000 appointments every week.", source_label: "Labour Manifesto 2024, p.45", source_url: "https://labour.org.uk/manifesto-2024/" },
      ],
      conservative: [
        { type: "manifesto", date: "2024-06-11", headline: "Real-terms NHS funding rises", quote: "We will increase NHS spending in real terms every year.", source_label: "Conservative Manifesto 2024, p.32", source_url: "https://conservatives.com/manifesto-2024/" },
      ],
      libdem: [
        { type: "manifesto", date: "2024-06-10", headline: "Seven-day GP guarantee", quote: "Everyone should have the right to see a GP within seven days.", source_label: "Lib Dem Manifesto 2024, p.22", source_url: "https://libdems.org.uk/manifesto-2024" },
      ],
      snp: [
        { type: "manifesto", date: "2024-06-19", headline: "Free prescriptions in Scotland", quote: "Scotland will keep prescriptions free at the point of need.", source_label: "SNP Manifesto 2024, p.15", source_url: "https://snp.org/manifesto-2024" },
      ],
    },
  },
  immigration: {
    label: "Immigration & Borders",
    summaries: {
      labour:       "Labour wants a stronger Border Security Command and faster asylum decisions, ending the Rwanda scheme.",
      conservative: "Conservatives commit to a legal migration cap and continued offshore-processing partnerships.",
      libdem:       "Lib Dems propose safe and legal routes for refugees and ending indefinite detention.",
      snp:          "The SNP backs devolved migration powers to address Scotland's specific labour-market needs.",
    },
    timelines: {
      labour: [
        { type: "manifesto", date: "2024-06-13", headline: "Border Security Command", quote: "We will set up a new Border Security Command with new counter-terror powers.", source_label: "Labour Manifesto 2024, p.50", source_url: "https://labour.org.uk/manifesto-2024/" },
      ],
      conservative: [
        { type: "manifesto", date: "2024-06-11", headline: "Binding migration cap", quote: "We will introduce a binding cap on net migration.", source_label: "Conservative Manifesto 2024, p.27", source_url: "https://conservatives.com/manifesto-2024/" },
      ],
      libdem: [
        { type: "manifesto", date: "2024-06-10", headline: "Safe routes and end of indefinite detention", quote: "We will create safe and legal routes for refugees and end indefinite detention.", source_label: "Lib Dem Manifesto 2024, p.34", source_url: "https://libdems.org.uk/manifesto-2024" },
      ],
      snp: [
        { type: "manifesto", date: "2024-06-19", headline: "Devolved migration policy", quote: "Migration policy should be devolved to meet Scotland's needs.", source_label: "SNP Manifesto 2024, p.21", source_url: "https://snp.org/manifesto-2024" },
      ],
    },
  },
  environment: {
    label: "Environment & Climate",
    summaries: {
      labour:       "Labour pledges GB Energy, a publicly owned green-energy company, and a 2030 clean-power target.",
      conservative: "Conservatives back a pragmatic net-zero pathway with continued North Sea licensing.",
      libdem:       "Lib Dems want to bring forward the net-zero target and ban new fossil-fuel exploration.",
      snp:          "The SNP commits Scotland to net zero by 2045 and a just transition for energy workers.",
    },
    timelines: {
      labour: [
        { type: "manifesto", date: "2024-06-13", headline: "GB Energy launch", quote: "Great British Energy will be a publicly owned, clean energy company.", source_label: "Labour Manifesto 2024, p.16", source_url: "https://labour.org.uk/manifesto-2024/" },
      ],
      conservative: [
        { type: "manifesto", date: "2024-06-11", headline: "Pragmatic net-zero pathway", quote: "We will reach net zero by 2050 in a way that is proportionate and pragmatic.", source_label: "Conservative Manifesto 2024, p.55", source_url: "https://conservatives.com/manifesto-2024/" },
      ],
      libdem: [
        { type: "manifesto", date: "2024-06-10", headline: "Net zero by 2045", quote: "We will reach net zero by 2045 and ban new oil and gas exploration.", source_label: "Lib Dem Manifesto 2024, p.42", source_url: "https://libdems.org.uk/manifesto-2024" },
      ],
      snp: [
        { type: "manifesto", date: "2024-06-19", headline: "Net zero by 2045 with a just transition", quote: "Scotland will reach net zero by 2045, with a just transition for our workers.", source_label: "SNP Manifesto 2024, p.24", source_url: "https://snp.org/manifesto-2024" },
      ],
    },
  },
  economy: {
    label: "Economy & Tax",
    summaries: {
      labour:       "Labour pledges no rise in income tax, NI, or VAT, with growth driven by public investment.",
      conservative: "Conservatives propose a 2p further cut to National Insurance and tax cuts for self-employed.",
      libdem:       "Lib Dems want to reverse tax cuts for big banks and raise capital gains tax for the wealthiest.",
      snp:          "The SNP backs a Scottish Wealth Tax and a four-day working week pilot.",
    },
    timelines: {
      labour: [
        { type: "manifesto", date: "2024-06-13", headline: "No rise in income tax, NI or VAT", quote: "We will not increase taxes on working people.", source_label: "Labour Manifesto 2024, p.24", source_url: "https://labour.org.uk/manifesto-2024/" },
      ],
      conservative: [
        { type: "manifesto", date: "2024-06-11", headline: "Further 2p NI cut", quote: "We will cut National Insurance by a further 2p.", source_label: "Conservative Manifesto 2024, p.18", source_url: "https://conservatives.com/manifesto-2024/" },
      ],
      libdem: [
        { type: "manifesto", date: "2024-06-10", headline: "Reverse bank tax cuts", quote: "We will reverse tax cuts for the big banks and raise capital gains tax on the wealthiest.", source_label: "Lib Dem Manifesto 2024, p.51", source_url: "https://libdems.org.uk/manifesto-2024" },
      ],
      snp: [
        { type: "manifesto", date: "2024-06-19", headline: "Four-day week pilot and wealth tax", quote: "We will pilot a four-day working week and progressive wealth taxation.", source_label: "SNP Manifesto 2024, p.27", source_url: "https://snp.org/manifesto-2024" },
      ],
    },
  },
};

function manifestoCitation(timeline) {
  const m = timeline.find((e) => e.type === "manifesto");
  return m ? { quote: m.quote, source: m.source_label } : null;
}

function findPerson(query) {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  for (const p of Object.values(MOCK_PEOPLE)) {
    if (p.name.toLowerCase() === q || p.aliases.includes(q)) return p;
  }
  return null;
}

function mockPersonResult(person, nation) {
  const partyIds = NATION_PARTIES[nation] || NATION_PARTIES.UK;
  const parties = partyIds.map((pid) => {
    const meta = PARTY_META[pid];
    if (pid !== person.party_id) {
      return { id: pid, name: meta.name, colour: meta.colour, empty: true };
    }
    return {
      id: pid,
      name: meta.name,
      colour: meta.colour,
      empty: false,
      person_summary: person.person_summary,
      citations: person.citations,
    };
  });
  return { query_type: "person", person, parties };
}

function mockTopicResult(query, nation) {
  const axisId = detectAxis(query);
  const topic = TOPIC_DATA[axisId];
  const partyIds = NATION_PARTIES[nation] || NATION_PARTIES.UK;
  const parties = partyIds.map((pid) => {
    const meta = PARTY_META[pid];
    const timeline = topic.timelines[pid] || [];
    const citation = manifestoCitation(timeline);
    return {
      id: pid,
      name: meta.name,
      colour: meta.colour,
      empty: false,
      summary: topic.summaries[pid],
      citations: citation ? [citation] : [],
      results: timeline,
    };
  });
  return {
    query_type: "topic",
    axisId,
    axisLabel: topic.label,
    topic: query,
    parties,
  };
}

// ─── MPs by party ─────────────────────────────────────────────────
const PARTY_MPS = {
  labour: [
    { id: "lisa-nandy",         name: "Lisa Nandy",         constituency: "Wigan",                          role: "Sec. of State for Culture, Media and Sport" },
    { id: "wes-streeting",      name: "Wes Streeting",      constituency: "Ilford North",                   role: "Sec. of State for Health and Social Care" },
    { id: "bridget-phillipson", name: "Bridget Phillipson", constituency: "Houghton and Sunderland South",  role: "Sec. of State for Education" },
    { id: "yvette-cooper",      name: "Yvette Cooper",      constituency: "Pontefract, Castleford & Knottingley", role: "Home Secretary" },
    { id: "angela-rayner",      name: "Angela Rayner",      constituency: "Ashton-under-Lyne",              role: "Deputy Prime Minister" },
  ],
  conservative: [
    { id: "robert-jenrick",     name: "Robert Jenrick",     constituency: "Newark",                         role: "Shadow Lord Chancellor" },
    { id: "kemi-badenoch",      name: "Kemi Badenoch",      constituency: "North West Essex",               role: "Leader of the Opposition" },
    { id: "priti-patel",        name: "Priti Patel",        constituency: "Witham",                         role: "Shadow Foreign Secretary" },
    { id: "james-cleverly",     name: "James Cleverly",     constituency: "Braintree",                      role: "Shadow Home Secretary" },
    { id: "mel-stride",         name: "Mel Stride",         constituency: "Central Devon",                  role: "Shadow Chancellor" },
  ],
  libdem: [
    { id: "daisy-cooper",       name: "Daisy Cooper",       constituency: "St Albans",                      role: "Deputy Leader, Health spokesperson" },
    { id: "ed-davey",           name: "Ed Davey",           constituency: "Kingston and Surbiton",          role: "Leader of the Liberal Democrats" },
    { id: "layla-moran",        name: "Layla Moran",        constituency: "Oxford West and Abingdon",       role: "Foreign Affairs spokesperson" },
    { id: "tim-farron",         name: "Tim Farron",         constituency: "Westmorland and Lonsdale",       role: "Environment spokesperson" },
    { id: "sarah-olney",        name: "Sarah Olney",        constituency: "Richmond Park",                  role: "Treasury spokesperson" },
  ],
  snp: [
    { id: "stephen-flynn",      name: "Stephen Flynn",      constituency: "Aberdeen South",                 role: "Westminster Leader" },
    { id: "mhairi-black",       name: "Mhairi Black",       constituency: "Paisley and Renfrewshire South", role: "Deputy Westminster Leader" },
    { id: "kirsty-blackman",    name: "Kirsty Blackman",    constituency: "Aberdeen North",                 role: "Treasury spokesperson" },
  ],
};

// ─── Articles per (topic × party) ─────────────────────────────────
const ARTICLES = {
  housing: {
    labour: [
      { source: "The Guardian", date: "2026-04-25", headline: "Labour vows to deliver on rental reform 'within first 100 days'", excerpt: "Bridget Phillipson and Lisa Nandy laid out the party's housing programme at a joint press conference, focusing on Section 21 reform and a renewed Decent Homes standard.", url: "https://www.theguardian.com/politics" },
      { source: "BBC News",      date: "2026-04-18", headline: "Renters' Rights Bill clears Commons by big margin",                                       excerpt: "The bill passed second reading 412 to 96, with Labour MPs voting unanimously in favour. Cooper described the result as 'long overdue'.",                                                          url: "https://www.bbc.co.uk/news/uk-politics" },
      { source: "Financial Times", date: "2026-03-22", headline: "Labour plans rent cap 'tied to local wages'",                                         excerpt: "Treasury sources tell the FT the cap could vary by region, with London likely to see a different formula from the rest of England.",                                                              url: "https://www.ft.com/uk-politics" },
    ],
    conservative: [
      { source: "The Telegraph", date: "2026-04-21", headline: "Conservatives warn Labour rent cap 'will shrink supply'",                                excerpt: "Jenrick and Badenoch issued a joint statement claiming the policy would drive small landlords out of the market within two years.",                                                              url: "https://www.telegraph.co.uk/politics/" },
      { source: "BBC News",      date: "2026-04-09", headline: "Tory MPs split on Renters' Rights Amendment",                                            excerpt: "Despite a three-line whip against, 53 Conservative backbenchers voted with Labour. Mel Stride called it 'a healthy debate'.",                                                                  url: "https://www.bbc.co.uk/news/uk-politics" },
      { source: "The Times",     date: "2026-03-15", headline: "Stamp-duty relief plan 'tilted to landlords', critics say",                              excerpt: "The Conservative proposal would offer first-time landlords a stamp-duty discount, mirroring the existing first-time buyer scheme.",                                                              url: "https://www.thetimes.co.uk/" },
    ],
    libdem: [
      { source: "The Guardian", date: "2026-04-19", headline: "Lib Dems table amendment for national landlord register",                                 excerpt: "Daisy Cooper led the cross-party amendment requiring all landlords to register before letting any property. The amendment was accepted on the second reading.",                                  url: "https://www.theguardian.com/politics" },
      { source: "The Independent", date: "2026-03-30", headline: "Cooper: 'rent caps without supply reform are a recipe for shortages'",                 excerpt: "The Lib Dem deputy leader called for a balanced approach combining renter protections with major housebuilding investment.",                                                                       url: "https://www.independent.co.uk/news/uk/politics" },
    ],
    snp: [
      { source: "The Herald",    date: "2026-04-12", headline: "Scottish Government extends emergency rent freeze",                                      excerpt: "First Minister announced the cap will continue through 2027 alongside new tenant-eviction protections.",                                                                                          url: "https://www.heraldscotland.com/" },
      { source: "BBC Scotland",  date: "2026-03-08", headline: "SNP MPs call for devolved housing benefit",                                              excerpt: "Stephen Flynn told Westminster that Scotland needs full control over Universal Credit's housing element to meet local rent levels.",                                                                url: "https://www.bbc.co.uk/news/scotland-politics" },
    ],
  },
  education: {
    labour: [
      { source: "The Guardian", date: "2026-04-12", headline: "Phillipson outlines progressive student-finance reform", excerpt: "The Education Secretary signalled a shift to graduate-contribution payments tied to lifetime earnings, replacing the current loan model.", url: "https://www.theguardian.com/education" },
      { source: "BBC News",      date: "2026-03-28", headline: "Labour boosts further-education funding by £1.4bn",     excerpt: "Funding for FE colleges to be increased over three years to deliver the manifesto pledge on adult skills.",                                  url: "https://www.bbc.co.uk/news/education" },
      { source: "TES",           date: "2026-02-19", headline: "Teacher recruitment campaign sees 18% uplift",          excerpt: "Bridget Phillipson hailed the figures as proof the new bursary scheme is working.",                                                       url: "https://www.tes.com/" },
    ],
    conservative: [
      { source: "The Telegraph", date: "2026-04-08", headline: "Tories pledge return to 'rigorous' grammar pathway",    excerpt: "Kemi Badenoch announced plans to expand selective schooling and protect academy autonomy.",                                                  url: "https://www.telegraph.co.uk/politics/" },
      { source: "TES",           date: "2026-03-12", headline: "Stride defends apprenticeship levy as 'jobs-first'",     excerpt: "The Shadow Chancellor said the levy redirected toward higher-value courses would expand opportunities for under-25s.",                       url: "https://www.tes.com/" },
    ],
    libdem: [
      { source: "BBC News",      date: "2026-04-15", headline: "Davey: 'Restore maintenance grants now'",               excerpt: "The Lib Dem leader called for an immediate reversal of the 2016 maintenance-grant abolition.",                                                  url: "https://www.bbc.co.uk/news/education" },
      { source: "The Guardian", date: "2026-03-02", headline: "Lib Dems table amendment to cap interest on student loans", excerpt: "The amendment proposes pegging interest to RPI rather than RPI+3%, saving graduates an average £1,200 per year.",                          url: "https://www.theguardian.com/education" },
    ],
    snp: [
      { source: "The Herald",    date: "2026-03-25", headline: "Scottish Government confirms free tuition will continue", excerpt: "John Swinney reiterated the long-standing pledge despite pressure on the Scottish budget.",                                                  url: "https://www.heraldscotland.com/" },
    ],
  },
  health: {
    labour: [
      { source: "The Guardian", date: "2026-04-22", headline: "Streeting sets 18-week NHS waiting target",              excerpt: "The Health Secretary committed to returning the NHS to constitutional waiting-time standards by the end of the parliament.",                  url: "https://www.theguardian.com/society/nhs" },
      { source: "BBC News",      date: "2026-03-19", headline: "40,000 extra NHS appointments added since November",     excerpt: "Department of Health figures show the new evening and weekend slots have cut some waiting lists by 12%.",                                  url: "https://www.bbc.co.uk/news/health" },
    ],
    conservative: [
      { source: "The Telegraph", date: "2026-04-11", headline: "Conservatives warn NHS reform 'risks postcode lottery'", excerpt: "Shadow Health Secretary said Labour's regional commissioning plan would entrench inequality.",                                                  url: "https://www.telegraph.co.uk/politics/" },
    ],
    libdem: [
      { source: "BBC News",      date: "2026-04-05", headline: "Cooper: 'GP shortage is a national emergency'",          excerpt: "The Lib Dem health spokesperson called for emergency funding to recruit 8,000 more GPs over the next two years.",                              url: "https://www.bbc.co.uk/news/health" },
    ],
    snp: [
      { source: "The Herald",    date: "2026-03-30", headline: "Scottish NHS pay rise agreed for 2026-27",               excerpt: "The Scottish Government announced an above-inflation pay deal for nurses, midwives and porters.",                                                url: "https://www.heraldscotland.com/" },
    ],
  },
  immigration: {
    labour: [
      { source: "The Guardian", date: "2026-04-18", headline: "Cooper announces Border Security Command leadership",     excerpt: "The Home Secretary appointed a former Crown Prosecution Service head to lead the new unit targeting people-smuggling networks.",            url: "https://www.theguardian.com/uk/immigration" },
    ],
    conservative: [
      { source: "The Telegraph", date: "2026-04-02", headline: "Patel: 'Migration cap must have legal force'",            excerpt: "The Shadow Foreign Secretary called for the proposed migration cap to be enshrined in primary legislation.",                                  url: "https://www.telegraph.co.uk/politics/" },
    ],
    libdem: [
      { source: "BBC News",      date: "2026-03-22", headline: "Moran proposes safe routes for asylum seekers",          excerpt: "The Lib Dem foreign affairs spokesperson called for resettlement targets matched to UN Refugee Agency need assessments.",                       url: "https://www.bbc.co.uk/news/uk" },
    ],
    snp: [
      { source: "The Herald",    date: "2026-03-15", headline: "Flynn: 'Scotland needs migration powers to grow'",       excerpt: "The SNP Westminster Leader said Scotland's labour shortages cannot be addressed without devolved control over visas.",                          url: "https://www.heraldscotland.com/" },
    ],
  },
  environment: {
    labour: [
      { source: "The Guardian", date: "2026-04-20", headline: "GB Energy clears parliamentary stages",                    excerpt: "The publicly owned clean-energy company is now a legal entity, with first investments expected in offshore wind and tidal.",                  url: "https://www.theguardian.com/environment" },
    ],
    conservative: [
      { source: "The Telegraph", date: "2026-04-04", headline: "Conservatives push 'pragmatic' net-zero approach",        excerpt: "Shadow Energy Secretary said the 2050 target should be retained but interim deadlines reviewed for affordability.",                              url: "https://www.telegraph.co.uk/politics/" },
    ],
    libdem: [
      { source: "BBC News",      date: "2026-03-28", headline: "Farron tables amendment to ban new oil licences",         excerpt: "The Lib Dem environment spokesperson said new exploration is incompatible with the 2045 net-zero target.",                                       url: "https://www.bbc.co.uk/news/uk" },
    ],
    snp: [
      { source: "The Herald",    date: "2026-04-01", headline: "Scotland on track for 2045 net-zero target",              excerpt: "The Scottish Government's annual emissions report shows the 2024 target was met for the first time in three years.",                                url: "https://www.heraldscotland.com/" },
    ],
  },
  economy: {
    labour: [
      { source: "The Guardian", date: "2026-04-16", headline: "Reeves rules out income-tax rise in autumn statement",     excerpt: "The Chancellor reiterated Labour's manifesto commitment to no rises in income tax, NI, or VAT.",                                                url: "https://www.theguardian.com/business" },
    ],
    conservative: [
      { source: "The Telegraph", date: "2026-04-08", headline: "Stride: 'Further NI cut would boost wages'",              excerpt: "The Shadow Chancellor said a 2p cut would put around £450 in the pocket of the average worker.",                                                  url: "https://www.telegraph.co.uk/business/" },
    ],
    libdem: [
      { source: "BBC News",      date: "2026-03-30", headline: "Olney calls for windfall tax extension",                  excerpt: "The Lib Dem treasury spokesperson said extending the tax to other sectors could raise £4bn for the NHS.",                                       url: "https://www.bbc.co.uk/news/business" },
    ],
    snp: [
      { source: "The Herald",    date: "2026-03-12", headline: "Blackman backs four-day-week pilot",                      excerpt: "The SNP treasury spokesperson said early data from the Scottish trial showed productivity gains.",                                                  url: "https://www.heraldscotland.com/" },
    ],
  },
};

// ─── Per-MP per-topic positions ─────────────────────────────────
const MP_POSITIONS = {
  "lisa-nandy": {
    housing:  [{ type: "statement", date: "2026-04-12", headline: "Nandy at LGA Conference: housing as social infrastructure", quote: "Decent housing is a foundation, not a privilege.",                       source_label: "LGA Conference, 12 Apr 2026", source_url: "https://www.local.gov.uk/" }],
    education: [{ type: "statement", date: "2026-02-08", headline: "Backs creative-arts funding in state schools",                quote: "Cutting arts education narrows the country in ways we don't measure.", source_label: "DCMS press release, 08 Feb 2026", source_url: "https://www.gov.uk/dcms" }],
  },
  "wes-streeting": {
    health:   [{ type: "statement", date: "2026-04-22", headline: "Streeting commits to 18-week NHS target",                       quote: "We will return the NHS to its constitutional waiting standards.",       source_label: "DHSC briefing, 22 Apr 2026",  source_url: "https://www.gov.uk/dhsc" }],
    economy:  [{ type: "vote",      date: "2026-03-08", headline: "Voted for Health and Social Care levy reform",                   quote: "Aye lobby, division 408.",                                              source_label: "Hansard division 408, 08 Mar 2026", source_url: "https://hansard.parliament.uk/" }],
  },
  "bridget-phillipson": {
    education: [
      { type: "statement", date: "2026-03-05", headline: "Phillipson outlines progressive student-finance reform",  quote: "Working-class graduates should not pay the highest effective marginal tax rate in the country.", source_label: "Labour press release, 05 Mar 2026", source_url: "https://labour.org.uk/press/" },
      { type: "vote",      date: "2026-02-14", headline: "Voted for Schools Funding Equalisation Bill",            quote: "Aye lobby, division 392.",                                                                       source_label: "Hansard division 392, 14 Feb 2026", source_url: "https://hansard.parliament.uk/" },
    ],
  },
  "yvette-cooper": {
    immigration: [{ type: "statement", date: "2026-04-18", headline: "Cooper appoints Border Security Command lead",            quote: "We will dismantle the gangs profiting from human misery.",               source_label: "Home Office briefing, 18 Apr 2026", source_url: "https://www.gov.uk/home-office" }],
    housing:    [{ type: "vote",      date: "2026-03-14", headline: "Voted FOR Renters' Rights Amendment",                       quote: "Aye lobby, division 412.",                                                source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" }],
  },
  "angela-rayner": {
    housing:  [{ type: "statement", date: "2026-04-08", headline: "Rayner sets 1.5 million homes target as central mission",   quote: "We will build 1.5 million new homes — and they will be where people need them.", source_label: "MHCLG briefing, 08 Apr 2026", source_url: "https://www.gov.uk/mhclg" }],
    economy:  [{ type: "vote",      date: "2026-03-21", headline: "Voted for Workers' Rights Bill",                              quote: "Aye lobby, division 415.",                                                source_label: "Hansard division 415, 21 Mar 2026", source_url: "https://hansard.parliament.uk/" }],
  },
  "robert-jenrick": {
    housing:    [
      { type: "press", date: "2026-04-08", headline: "Jenrick: Renters' Rights Bill will 'shrink the rental market'",  quote: "Reform must work for renters and landlords. Tilting the field destroys both.", source_label: "Conservative press release, 08 Apr 2026", source_url: "https://conservatives.com/news/" },
      { type: "vote", date: "2026-03-14", headline: "Voted AGAINST Renters' Rights Amendment",                          quote: "No lobby, division 412.",                                                       source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" },
    ],
    immigration: [{ type: "statement", date: "2026-02-19", headline: "Jenrick calls for ECHR opt-out",                            quote: "We need to be able to act in our national interest without external oversight.", source_label: "Conservative press release, 19 Feb 2026", source_url: "https://conservatives.com/news/" }],
  },
  "kemi-badenoch": {
    education: [{ type: "statement", date: "2026-04-08", headline: "Badenoch backs grammar-school expansion",                    quote: "Selective education, where parents want it, should be defended.",        source_label: "Conservative press release, 08 Apr 2026", source_url: "https://conservatives.com/news/" }],
    economy:   [{ type: "statement", date: "2026-03-25", headline: "Critique of Labour fiscal stance",                            quote: "Borrowing for current spending is mortgaging tomorrow.",                  source_label: "Conservative press release, 25 Mar 2026", source_url: "https://conservatives.com/news/" }],
  },
  "priti-patel": {
    immigration: [{ type: "statement", date: "2026-04-02", headline: "Patel calls for binding migration cap",                     quote: "A cap with legal teeth is the only way to restore public trust.",         source_label: "Conservative press release, 02 Apr 2026", source_url: "https://conservatives.com/news/" }],
  },
  "james-cleverly": {
    immigration: [{ type: "statement", date: "2026-03-18", headline: "Cleverly defends offshore-processing model",                quote: "Removing the pull factors is the only way to break the gangs.",            source_label: "Conservative press release, 18 Mar 2026", source_url: "https://conservatives.com/news/" }],
    housing:    [{ type: "vote",      date: "2026-03-14", headline: "Voted AGAINST Renters' Rights Amendment",                    quote: "No lobby, division 412.",                                                source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" }],
  },
  "mel-stride": {
    economy: [
      { type: "statement", date: "2026-04-08", headline: "Stride: Further NI cut would boost wages",                              quote: "A 2p cut puts £450 in the pocket of the average worker.",                  source_label: "Conservative press release, 08 Apr 2026", source_url: "https://conservatives.com/news/" },
      { type: "vote",      date: "2026-03-22", headline: "Voted against Labour Budget",                                            quote: "No lobby, division 416.",                                                source_label: "Hansard division 416, 22 Mar 2026", source_url: "https://hansard.parliament.uk/" },
    ],
  },
  "daisy-cooper": {
    housing:  [{ type: "statement", date: "2026-04-19", headline: "Cooper: rent caps a 'short-term fix'",                         quote: "Build more, regulate fairly, end no-fault evictions. That's the formula.", source_label: "Lib Dem press release, 19 Apr 2026", source_url: "https://libdems.org.uk/news/" }],
    health:   [{ type: "statement", date: "2026-04-05", headline: "Cooper: 'GP shortage is a national emergency'",               quote: "We need 8,000 more GPs in the next two years, not the next decade.",    source_label: "Lib Dem press release, 05 Apr 2026", source_url: "https://libdems.org.uk/news/" }],
  },
  "ed-davey": {
    education: [{ type: "statement", date: "2026-04-15", headline: "Davey: 'Restore maintenance grants now'",                     quote: "Living costs should not be a class barrier to going to university.",     source_label: "Lib Dem press release, 15 Apr 2026", source_url: "https://libdems.org.uk/news/" }],
    economy:   [{ type: "vote",      date: "2026-03-22", headline: "Voted against Labour Budget on banking provisions",            quote: "No lobby, division 416.",                                                source_label: "Hansard division 416, 22 Mar 2026", source_url: "https://hansard.parliament.uk/" }],
  },
  "layla-moran": {
    immigration: [{ type: "statement", date: "2026-03-22", headline: "Moran proposes safe routes for asylum seekers",             quote: "The asylum system should match resettlement targets to UN need assessments.", source_label: "Lib Dem press release, 22 Mar 2026", source_url: "https://libdems.org.uk/news/" }],
  },
  "tim-farron": {
    environment: [{ type: "statement", date: "2026-03-28", headline: "Farron tables ban on new oil and gas licences",             quote: "New exploration is incompatible with our 2045 net-zero target.",         source_label: "Lib Dem press release, 28 Mar 2026", source_url: "https://libdems.org.uk/news/" }],
  },
  "sarah-olney": {
    economy: [{ type: "statement", date: "2026-03-30", headline: "Olney calls for windfall-tax extension",                        quote: "Extending it to other sectors could raise £4bn for the NHS.",            source_label: "Lib Dem press release, 30 Mar 2026", source_url: "https://libdems.org.uk/news/" }],
  },
  "stephen-flynn": {
    immigration: [{ type: "statement", date: "2026-03-15", headline: "Flynn: 'Scotland needs migration powers to grow'",          quote: "Scotland's labour shortages cannot be addressed without devolved visas.", source_label: "SNP press release, 15 Mar 2026",     source_url: "https://snp.org/news/" }],
    economy:    [{ type: "statement", date: "2026-04-02", headline: "Flynn: Westminster austerity is choking Scottish public services", quote: "Devolved budgets are being squeezed by decisions taken without Scotland's consent.", source_label: "SNP press release, 02 Apr 2026", source_url: "https://snp.org/news/" }],
  },
  "mhairi-black": {
    housing: [{ type: "vote", date: "2026-03-14", headline: "Voted FOR Renters' Rights Amendment", quote: "Aye lobby, division 412.", source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" }],
  },
  "kirsty-blackman": {
    economy: [{ type: "statement", date: "2026-03-12", headline: "Blackman backs four-day-week pilot",                            quote: "Early data from the Scottish trial shows productivity gains.",            source_label: "SNP press release, 12 Mar 2026",     source_url: "https://snp.org/news/" }],
  },
};

// ─── Per-MP accountability scores ───────────────────────────────
// Three independent scores per MP. For the demo these are hand-coded;
// production version is documented in PROGRESS.md (sentence-embedding
// similarity for consistency, raw Hansard counts for voting alignment,
// and a simple coverage count for record density).
const MP_SCORES = {
  "lisa-nandy":         { consistency: { value: 82, statements_aligned: 9, statements_total: 11, votes_aligned: 18, votes_total: 22 }, voting: { value: 96, with_party: 192, total: 200, last_against: "2025-11-08" }, record: { value: 78, statements: 11, votes: 22, press: 6 } },
  "wes-streeting":      { consistency: { value: 88, statements_aligned: 12, statements_total: 14, votes_aligned: 19, votes_total: 22 }, voting: { value: 95, with_party: 190, total: 200, last_against: "2025-09-22" }, record: { value: 85, statements: 14, votes: 22, press: 9 } },
  "bridget-phillipson": { consistency: { value: 84, statements_aligned: 10, statements_total: 12, votes_aligned: 20, votes_total: 23 }, voting: { value: 97, with_party: 194, total: 200, last_against: "2025-12-04" }, record: { value: 72, statements: 12, votes: 23, press: 5 } },
  "yvette-cooper":      { consistency: { value: 79, statements_aligned: 8, statements_total: 11, votes_aligned: 21, votes_total: 24 }, voting: { value: 98, with_party: 196, total: 200, last_against: "2025-07-15" }, record: { value: 88, statements: 11, votes: 24, press: 11 } },
  "angela-rayner":      { consistency: { value: 86, statements_aligned: 13, statements_total: 15, votes_aligned: 22, votes_total: 24 }, voting: { value: 99, with_party: 198, total: 200, last_against: "2025-05-30" }, record: { value: 91, statements: 15, votes: 24, press: 14 } },

  "robert-jenrick":     { consistency: { value: 71, statements_aligned: 8, statements_total: 12, votes_aligned: 16, votes_total: 22 }, voting: { value: 87, with_party: 174, total: 200, last_against: "2026-03-14" }, record: { value: 76, statements: 12, votes: 22, press: 8 } },
  "kemi-badenoch":      { consistency: { value: 75, statements_aligned: 11, statements_total: 14, votes_aligned: 21, votes_total: 24 }, voting: { value: 99, with_party: 198, total: 200, last_against: "2024-11-02" }, record: { value: 89, statements: 14, votes: 24, press: 13 } },
  "priti-patel":        { consistency: { value: 68, statements_aligned: 6, statements_total: 10, votes_aligned: 18, votes_total: 22 }, voting: { value: 91, with_party: 182, total: 200, last_against: "2026-02-08" }, record: { value: 70, statements: 10, votes: 22, press: 6 } },
  "james-cleverly":     { consistency: { value: 74, statements_aligned: 9, statements_total: 12, votes_aligned: 19, votes_total: 22 }, voting: { value: 93, with_party: 186, total: 200, last_against: "2026-01-19" }, record: { value: 65, statements: 12, votes: 22, press: 4 } },
  "mel-stride":         { consistency: { value: 80, statements_aligned: 10, statements_total: 13, votes_aligned: 19, votes_total: 22 }, voting: { value: 95, with_party: 190, total: 200, last_against: "2025-10-16" }, record: { value: 72, statements: 13, votes: 22, press: 7 } },

  "daisy-cooper":       { consistency: { value: 88, statements_aligned: 12, statements_total: 14, votes_aligned: 19, votes_total: 22 }, voting: { value: 92, with_party: 184, total: 200, last_against: "2026-02-26" }, record: { value: 68, statements: 14, votes: 22, press: 5 } },
  "ed-davey":           { consistency: { value: 90, statements_aligned: 13, statements_total: 14, votes_aligned: 20, votes_total: 22 }, voting: { value: 95, with_party: 190, total: 200, last_against: "2025-08-20" }, record: { value: 82, statements: 14, votes: 22, press: 11 } },
  "layla-moran":        { consistency: { value: 82, statements_aligned: 9, statements_total: 11, votes_aligned: 17, votes_total: 22 }, voting: { value: 88, with_party: 176, total: 200, last_against: "2026-03-04" }, record: { value: 60, statements: 11, votes: 22, press: 4 } },
  "tim-farron":         { consistency: { value: 76, statements_aligned: 8, statements_total: 11, votes_aligned: 16, votes_total: 22 }, voting: { value: 86, with_party: 172, total: 200, last_against: "2026-01-30" }, record: { value: 55, statements: 11, votes: 22, press: 3 } },
  "sarah-olney":        { consistency: { value: 78, statements_aligned: 8, statements_total: 11, votes_aligned: 18, votes_total: 22 }, voting: { value: 90, with_party: 180, total: 200, last_against: "2025-12-12" }, record: { value: 50, statements: 11, votes: 22, press: 2 } },

  "stephen-flynn":      { consistency: { value: 84, statements_aligned: 11, statements_total: 13, votes_aligned: 20, votes_total: 22 }, voting: { value: 94, with_party: 188, total: 200, last_against: "2025-11-29" }, record: { value: 70, statements: 13, votes: 22, press: 5 } },
  "mhairi-black":       { consistency: { value: 72, statements_aligned: 7, statements_total: 11, votes_aligned: 17, votes_total: 22 }, voting: { value: 81, with_party: 162, total: 200, last_against: "2026-04-02" }, record: { value: 58, statements: 11, votes: 22, press: 3 } },
  "kirsty-blackman":    { consistency: { value: 79, statements_aligned: 9, statements_total: 11, votes_aligned: 18, votes_total: 22 }, voting: { value: 90, with_party: 180, total: 200, last_against: "2026-02-15" }, record: { value: 52, statements: 11, votes: 22, press: 2 } },
};

// ─── Demo people for the person search ───────────────────────────
const MOCK_PEOPLE = {
  "lisa-nandy": {
    id: "lisa-nandy",
    name: "Lisa Nandy",
    aliases: ["nandy", "lisa nandy", "lisa nandy mp"],
    party_id: "labour",
    constituency: "Wigan",
    role: "Member of Parliament",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Official_portrait_of_Lisa_Nandy_MP_crop_2.jpg/220px-Official_portrait_of_Lisa_Nandy_MP_crop_2.jpg",
    bio: "Labour MP for Wigan since 2010. Secretary of State for Culture, Media and Sport since July 2024.",
    links: [
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Lisa_Nandy" },
      { label: "Parliament profile", url: "https://members.parliament.uk/member/4361/contact" },
      { label: "TheyWorkForYou", url: "https://www.theyworkforyou.com/mp/24935/lisa_nandy" },
    ],
    person_summary: "Nandy has consistently centred her recent statements on housing security and renter protection.",
    citations: [{ quote: "Decent housing is a foundation, not a privilege.", source: "Wigan town hall address, Mar 2026" }],
    results: [
      { type: "statement", date: "2026-04-12", headline: "Nandy at LGA Conference: housing as social infrastructure", quote: "Decent housing is a foundation, not a privilege — and a healthy nation knows the difference.", source_label: "LGA Conference, 12 Apr 2026", source_url: "https://www.local.gov.uk/" },
      { type: "vote", date: "2026-03-14", headline: "Voted FOR Renters' Rights Amendment", quote: "Aye lobby, division 412.", source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" },
    ],
  },
  "robert-jenrick": {
    id: "robert-jenrick",
    name: "Robert Jenrick",
    aliases: ["jenrick", "robert jenrick", "rob jenrick"],
    party_id: "conservative",
    constituency: "Newark",
    role: "Member of Parliament",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Official_portrait_of_Robert_Jenrick_MP_crop_2.jpg/220px-Official_portrait_of_Robert_Jenrick_MP_crop_2.jpg",
    bio: "Conservative MP for Newark since 2014. Shadow Lord Chancellor and Secretary of State for Justice.",
    links: [
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Robert_Jenrick" },
      { label: "Parliament profile", url: "https://members.parliament.uk/member/4320/contact" },
      { label: "TheyWorkForYou", url: "https://www.theyworkforyou.com/mp/24893/robert_jenrick" },
    ],
    person_summary: "Jenrick has focused recent statements on immigration enforcement and rental market reform.",
    citations: [{ quote: "Reform must work for renters and landlords. Tilting the field destroys both.", source: "Conservative press release, Apr 2026" }],
    results: [
      { type: "press", date: "2026-04-08", headline: "Jenrick: Renters' Rights Bill will 'shrink the rental market'", quote: "Reform must work for renters and landlords. Tilting the field destroys both.", source_label: "Conservative press release, 08 Apr 2026", source_url: "https://conservatives.com/news/" },
      { type: "vote", date: "2026-03-14", headline: "Voted AGAINST Renters' Rights Amendment", quote: "No lobby, division 412.", source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" },
    ],
  },
  "daisy-cooper": {
    id: "daisy-cooper",
    name: "Daisy Cooper",
    aliases: ["cooper", "daisy cooper"],
    party_id: "libdem",
    constituency: "St Albans",
    role: "Member of Parliament",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Official_portrait_of_Daisy_Cooper_MP_crop_2.jpg/220px-Official_portrait_of_Daisy_Cooper_MP_crop_2.jpg",
    bio: "Liberal Democrat MP for St Albans since 2019. Deputy Leader and Health spokesperson.",
    links: [
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Daisy_Cooper" },
      { label: "Parliament profile", url: "https://members.parliament.uk/member/4830/contact" },
      { label: "TheyWorkForYou", url: "https://www.theyworkforyou.com/mp/25895/daisy_cooper" },
    ],
    person_summary: "Cooper has championed landlord licensing and tabled the Lib Dem amendment to require a national register.",
    citations: [{ quote: "A national register of landlords is the floor, not the ceiling.", source: "Hansard, 02 Feb 2026" }],
    results: [
      { type: "statement", date: "2026-04-19", headline: "Cooper: rent caps a 'short-term fix'", quote: "Build more, regulate fairly, end no-fault evictions. That's the formula.", source_label: "Lib Dem press release, 19 Apr 2026", source_url: "https://libdems.org.uk/news/" },
    ],
  },
};
