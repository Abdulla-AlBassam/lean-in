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
    },
    {
      id: "conservative",
      name: "Conservative",
      colour: "#0087DC",
      summary: `Conservative policy on "${query}" prioritises market-led solutions and tax reform.`,
      citations: [
        { quote: "We will support landlords and renters through fair, balanced reform.", source: "Conservative Manifesto 2024, p.21" },
      ],
    },
    {
      id: "libdem",
      name: "Liberal Democrats",
      colour: "#FAA61A",
      summary: `The Lib Dems' approach to "${query}" balances civil liberties with targeted state support.`,
      citations: [
        { quote: "We will introduce a national register of landlords and ban no-fault evictions.", source: "Lib Dem Manifesto 2024, p.18" },
      ],
    },
  ];
  if (nation === "SCO") {
    base.push({
      id: "snp",
      name: "SNP",
      colour: "#FDF38E",
      summary: `In Scotland, the SNP's position on "${query}" emphasises devolved-power solutions.`,
      citations: [{ quote: "Scotland will lead with stronger renters' protections than Westminster.", source: "SNP Manifesto 2024, p.12" }],
    });
  }
  return {
    axisId: "housing",
    axisLabel: "Housing & Renting",
    parties: base,
  };
}
