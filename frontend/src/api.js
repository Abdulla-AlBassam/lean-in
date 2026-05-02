// Toggle this OFF when Builder A's backend is live.
const MOCK = true;
const BACKEND_URL = "http://localhost:8000";

export async function search(query, nation) {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 250));
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

function findPerson(query) {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  for (const p of Object.values(MOCK_PEOPLE)) {
    if (p.name.toLowerCase() === q) return p;
    if (p.aliases.some((a) => a === q)) return p;
  }
  return null;
}

function mockPersonResult(person, nation) {
  const partyIds = NATION_PARTIES[nation] || NATION_PARTIES.UK;
  const parties = partyIds.map((pid) => {
    const meta = PARTY_META[pid];
    const isThem = pid === person.party_id;
    if (!isThem) {
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
  return {
    query_type: "person",
    person,
    parties,
  };
}

function mockTopicResult(query, nation) {
  const partyIds = NATION_PARTIES[nation] || NATION_PARTIES.UK;
  const parties = partyIds.map((pid) => {
    const meta = PARTY_META[pid];
    const stub = TOPIC_STUBS[pid];
    return {
      id: pid,
      name: meta.name,
      colour: meta.colour,
      empty: false,
      summary: stub.summary(query),
      citations: stub.citations,
      results: TOPIC_RESULTS[pid] || [],
    };
  });
  return {
    query_type: "topic",
    axisId: "housing",
    axisLabel: "Housing & Renting",
    topic: query,
    parties,
  };
}

const TOPIC_STUBS = {
  labour: {
    summary: (q) => `Labour's position on "${q}" centres on public investment and worker protection.`,
    citations: [{ quote: "We will end no-fault evictions and cap rent increases.", source: "Labour Manifesto 2024, p.34" }],
  },
  conservative: {
    summary: (q) => `Conservative policy on "${q}" prioritises market-led solutions and tax reform.`,
    citations: [{ quote: "We will support landlords and renters through fair, balanced reform.", source: "Conservative Manifesto 2024, p.21" }],
  },
  libdem: {
    summary: (q) => `The Lib Dems' approach to "${q}" balances civil liberties with targeted state support.`,
    citations: [{ quote: "We will introduce a national register of landlords and ban no-fault evictions.", source: "Lib Dem Manifesto 2024, p.18" }],
  },
  snp: {
    summary: (q) => `In Scotland, the SNP's position on "${q}" emphasises devolved-power solutions.`,
    citations: [{ quote: "Scotland will lead with stronger renters' protections than Westminster.", source: "SNP Manifesto 2024, p.12" }],
  },
};

const TOPIC_RESULTS = {
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
  snp: [],
};

// Mock people. Maks's people.json replaces this when ready. Real photo URLs.
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
    citations: [
      { quote: "Decent housing is a foundation, not a privilege.", source: "Wigan town hall address, Mar 2026" },
    ],
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
    citations: [
      { quote: "Reform must work for renters and landlords. Tilting the field destroys both.", source: "Conservative press release, Apr 2026" },
    ],
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
    citations: [
      { quote: "A national register of landlords is the floor, not the ceiling.", source: "Hansard, 02 Feb 2026" },
    ],
    results: [
      { type: "statement", date: "2026-04-19", headline: "Cooper: rent caps a 'short-term fix'", quote: "Build more, regulate fairly, end no-fault evictions. That's the formula.", source_label: "Lib Dem press release, 19 Apr 2026", source_url: "https://libdems.org.uk/news/" },
      { type: "vote", date: "2026-03-14", headline: "Voted FOR Renters' Rights Amendment", quote: "Aye lobby, division 412.", source_label: "Hansard division 412, 14 Mar 2026", source_url: "https://hansard.parliament.uk/" },
      { type: "statement", date: "2026-02-02", headline: "Tabled amendment for national landlord register", quote: "A national register of landlords is the floor, not the ceiling.", source_label: "Hansard, 02 Feb 2026", source_url: "https://hansard.parliament.uk/" },
    ],
  },
};
