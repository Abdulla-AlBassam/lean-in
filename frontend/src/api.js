// Toggle this OFF when Builder A's /api/search returns real results.
const MOCK = true;
const BACKEND_URL = "http://localhost:8000";

export async function search(query, nation) {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    return mockResult(query, nation);
  }
  const url = `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}&nation=${nation}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

function mockResult(query, nation) {
  const base = [
    {
      id: "labour",
      name: "Labour",
      colour: "#E4003B",
      summary: `Labour's position on "${query}" centres on public investment and worker protection.`,
      citations: [
        { quote: "We will end no-fault evictions and cap rent increases.", source: "Labour Manifesto 2024, p.34" },
      ],
      results: mockResults("labour"),
    },
    {
      id: "conservative",
      name: "Conservative",
      colour: "#0087DC",
      summary: `Conservative policy on "${query}" prioritises market-led solutions and tax reform.`,
      citations: [
        { quote: "We will support landlords and renters through fair, balanced reform.", source: "Conservative Manifesto 2024, p.21" },
      ],
      results: mockResults("conservative"),
    },
    {
      id: "libdem",
      name: "Liberal Democrats",
      colour: "#FAA61A",
      summary: `The Lib Dems' approach to "${query}" balances civil liberties with targeted state support.`,
      citations: [
        { quote: "We will introduce a national register of landlords and ban no-fault evictions.", source: "Lib Dem Manifesto 2024, p.18" },
      ],
      results: mockResults("libdem"),
    },
  ];
  if (nation === "SCO") {
    base.push({
      id: "snp",
      name: "SNP",
      colour: "#FDF38E",
      summary: `In Scotland, the SNP's position on "${query}" emphasises devolved-power solutions.`,
      citations: [{ quote: "Scotland will lead with stronger renters' protections than Westminster.", source: "SNP Manifesto 2024, p.12" }],
      results: mockResults("snp"),
    });
  }
  return {
    axisId: "housing",
    axisLabel: "Housing & Renting",
    topic: query,
    parties: base,
  };
}

// Mock multi-results per party. Replaced when Builder D's results.json lands.
// Newest first.
function mockResults(partyId) {
  const sets = {
    labour: [
      {
        type: "press",
        date: "2026-04-22",
        headline: "Phillipson commits to capping rent rises in opening speech",
        quote: "We will not allow renters to be priced out of the homes they have built lives in.",
        source_label: "Labour press release, 22 Apr 2026",
        source_url: "https://labour.org.uk/press/2026/04/22/",
      },
      {
        type: "vote",
        date: "2026-03-14",
        headline: "Labour MPs back the Renters' Rights Amendment Bill",
        quote: "Labour voted in favour of the amendment by 198 to 0 (front-bench whip).",
        source_label: "Hansard division 412, 14 Mar 2026",
        source_url: "https://hansard.parliament.uk/commons/2026-03-14/divisions/412",
      },
      {
        type: "statement",
        date: "2025-11-08",
        headline: "Conference speech: housing as a right, not an asset",
        quote: "Decent housing is the foundation of a decent life. We will treat it that way.",
        source_label: "Labour Annual Conference, 08 Nov 2025",
        source_url: "https://labour.org.uk/conference-2025/",
      },
      {
        type: "manifesto",
        date: "2024-06-13",
        headline: "Manifesto pledge: end Section 21 no-fault evictions",
        quote: "We will end no-fault evictions and cap rent increases.",
        source_label: "Labour Manifesto 2024, p.34",
        source_url: "https://labour.org.uk/manifesto-2024/#housing",
      },
    ],
    conservative: [
      {
        type: "press",
        date: "2026-04-15",
        headline: "Conservatives propose stamp-duty relief for first-time landlords",
        quote: "Backing those who invest in housing is backing those who house Britain.",
        source_label: "Conservative press release, 15 Apr 2026",
        source_url: "https://conservatives.com/news/2026/04/15/",
      },
      {
        type: "vote",
        date: "2026-03-14",
        headline: "Conservative bench split on Renters' Rights Amendment",
        quote: "Conservative MPs voted 142 against, 53 for, 18 abstained.",
        source_label: "Hansard division 412, 14 Mar 2026",
        source_url: "https://hansard.parliament.uk/commons/2026-03-14/divisions/412",
      },
      {
        type: "manifesto",
        date: "2024-06-11",
        headline: "Manifesto pledge: balanced reform of the rental market",
        quote: "We will support landlords and renters through fair, balanced reform.",
        source_label: "Conservative Manifesto 2024, p.21",
        source_url: "https://conservatives.com/manifesto-2024/",
      },
    ],
    libdem: [
      {
        type: "press",
        date: "2026-04-19",
        headline: "Cooper: rent caps a 'short-term fix that creates long-term shortages'",
        quote: "Build more, regulate fairly, end no-fault evictions. That's the formula.",
        source_label: "Lib Dem press release, 19 Apr 2026",
        source_url: "https://libdems.org.uk/news/2026-04-19",
      },
      {
        type: "statement",
        date: "2026-02-02",
        headline: "Lib Dems table amendment to require landlord licensing",
        quote: "A national register of landlords is the floor, not the ceiling.",
        source_label: "Hansard, 02 Feb 2026",
        source_url: "https://hansard.parliament.uk/commons/2026-02-02/",
      },
      {
        type: "manifesto",
        date: "2024-06-10",
        headline: "Manifesto pledge: national register of landlords",
        quote: "We will introduce a national register of landlords and ban no-fault evictions.",
        source_label: "Lib Dem Manifesto 2024, p.18",
        source_url: "https://libdems.org.uk/manifesto-2024",
      },
    ],
    snp: [
      {
        type: "statement",
        date: "2026-03-30",
        headline: "Scottish Government extends rent-cap emergency legislation",
        quote: "Scotland's renters will not pay the price for Westminster's inaction.",
        source_label: "Scottish Government press release, 30 Mar 2026",
        source_url: "https://gov.scot/news/2026-03-30/",
      },
      {
        type: "manifesto",
        date: "2024-06-19",
        headline: "Manifesto pledge: stronger renters' protections than Westminster",
        quote: "Scotland will lead with stronger renters' protections than Westminster.",
        source_label: "SNP Manifesto 2024, p.12",
        source_url: "https://snp.org/manifesto-2024",
      },
    ],
  };
  return sets[partyId] || [];
}
