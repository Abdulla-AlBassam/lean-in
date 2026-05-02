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
        { type: "press", date: "2026-04-22", headline: "Phillipson commits to capping rent rises", quote: "We will not allow renters to be priced out.", source_label: "Labour press release, 22 Apr 2026", source_url: "https://labour.org.uk/press/2026/04/22/" },
        { type: "vote", date: "2026-03-14", headline: "Labour MPs back the Renters' Rights Amendment", quote: "Labour voted in favour by 198 to 0 (front-bench whip).", source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" },
        { type: "manifesto", date: "2024-06-13", headline: "Manifesto pledge: end Section 21 no-fault evictions", quote: "We will end no-fault evictions and cap rent increases.", source_label: "Labour Manifesto 2024, p.34", source_url: "https://labour.org.uk/manifesto-2024/" },
      ],
      conservative: [
        { type: "press", date: "2026-04-15", headline: "Stamp-duty relief for first-time landlords", quote: "Backing those who invest in housing is backing those who house Britain.", source_label: "Conservative press release, 15 Apr 2026", source_url: "https://conservatives.com/news/" },
        { type: "manifesto", date: "2024-06-11", headline: "Balanced reform of the rental market", quote: "We will support landlords and renters through fair, balanced reform.", source_label: "Conservative Manifesto 2024, p.21", source_url: "https://conservatives.com/manifesto-2024/" },
      ],
      libdem: [
        { type: "press", date: "2026-04-19", headline: "Cooper: 'rent caps create long-term shortages'", quote: "Build more, regulate fairly, end no-fault evictions.", source_label: "Lib Dem press release, 19 Apr 2026", source_url: "https://libdems.org.uk/news/" },
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
        { type: "press", date: "2026-03-05", headline: "Phillipson outlines progressive student-finance reform", quote: "Working-class graduates should not pay the highest effective marginal tax rate in the country.", source_label: "Labour press release, 05 Mar 2026", source_url: "https://labour.org.uk/press/" },
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
        { type: "vote", date: "2026-02-20", headline: "Labour MPs vote against NHS reorganisation bill", quote: "We will not let the NHS be carved up by stealth.", source_label: "Hansard division 287, 20 Feb 2026", source_url: "https://hansard.parliament.uk/" },
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
    person_summary: "Nandy has consistently centred her recent statements on housing security and renter protection, voting with the Labour front bench on the Renters' Rights Amendment.",
    citations: [{ quote: "Decent housing is a foundation, not a privilege.", source: "Wigan town hall address, Mar 2026" }],
    results: [
      { type: "statement", date: "2026-04-12", headline: "Nandy at LGA Conference: housing as social infrastructure", quote: "Decent housing is a foundation, not a privilege — and a healthy nation knows the difference.", source_label: "LGA Conference, 12 Apr 2026", source_url: "https://www.local.gov.uk/" },
      { type: "vote", date: "2026-03-14", headline: "Voted FOR Renters' Rights Amendment", quote: "Aye lobby, division 412.", source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" },
      { type: "press", date: "2025-11-08", headline: "Conference speech: rebuilding civic life", quote: "Communities are not a sentimental idea — they are how a country actually functions.", source_label: "Labour Annual Conference, 08 Nov 2025", source_url: "https://labour.org.uk/conference-2025/" },
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
    person_summary: "Jenrick has focused recent statements on immigration enforcement and rental market reform, opposing the Renters' Rights Amendment in March 2026.",
    citations: [{ quote: "Reform must work for renters and landlords. Tilting the field destroys both.", source: "Conservative press release, Apr 2026" }],
    results: [
      { type: "press", date: "2026-04-08", headline: "Jenrick: Renters' Rights Bill will 'shrink the rental market'", quote: "Reform must work for renters and landlords. Tilting the field destroys both.", source_label: "Conservative press release, 08 Apr 2026", source_url: "https://conservatives.com/news/" },
      { type: "vote", date: "2026-03-14", headline: "Voted AGAINST Renters' Rights Amendment", quote: "No lobby, division 412.", source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" },
      { type: "statement", date: "2025-09-30", headline: "Conference speech: a fairer settlement on housing", quote: "We need to build, not regulate our way out of the housing crisis.", source_label: "Conservative Conference, 30 Sep 2025", source_url: "https://conservatives.com/conference-2025/" },
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
    person_summary: "Cooper has championed landlord licensing and tabled the Lib Dem amendment to require a national register, while also pressing for NHS waiting-time targets.",
    citations: [{ quote: "A national register of landlords is the floor, not the ceiling.", source: "Hansard, 02 Feb 2026" }],
    results: [
      { type: "statement", date: "2026-04-19", headline: "Cooper: rent caps a 'short-term fix'", quote: "Build more, regulate fairly, end no-fault evictions. That's the formula.", source_label: "Lib Dem press release, 19 Apr 2026", source_url: "https://libdems.org.uk/news/" },
      { type: "vote", date: "2026-03-14", headline: "Voted FOR Renters' Rights Amendment", quote: "Aye lobby, division 412.", source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" },
      { type: "statement", date: "2026-02-02", headline: "Tabled amendment for national landlord register", quote: "A national register of landlords is the floor, not the ceiling.", source_label: "Hansard, 02 Feb 2026", source_url: "https://hansard.parliament.uk/" },
    ],
  },
};
