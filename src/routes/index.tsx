import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Legend, LineChart, Line,
} from "recharts";
import surveyData from "@/data/survey.json";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, Users, ShieldAlert, TrendingUp, AlertTriangle } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")(
  { component: Dashboard }
);

type Row = {
  id: string; age: string; sex: string; civil: string; edu: string;
  Poverty: number; "Lack of Security": number; "High Market Demand": number;
  Envy: number; Vengeance: number; Pettiness: number;
};

const FACTORS = surveyData.meta.factors as string[];
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "oklch(0.7 0.18 50)"];

function interpret(m: number) {
  if (m >= 3.25) return { label: "Strongly Agree", tone: "bg-destructive/20 text-destructive border-destructive/40" };
  if (m >= 2.5) return { label: "Agree", tone: "bg-primary/20 text-primary border-primary/40" };
  if (m >= 1.75) return { label: "Disagree", tone: "bg-accent/20 text-accent border-accent/40" };
  return { label: "Strongly Disagree", tone: "bg-muted text-muted-foreground border-border" };
}

function Dashboard() {
  const [demoFilter, setDemoFilter] = useState<{ key: string; value: string } | null>(null);
  const rows = surveyData.rows as Row[];

  const filtered = useMemo(() => {
    if (!demoFilter) return rows;
    return rows.filter((r) => (r as any)[demoFilter.key] === demoFilter.value);
  }, [demoFilter, rows]);

  const factorMeans = useMemo(() => {
    return FACTORS.map((f) => {
      const vals = filtered.map((r) => (r as any)[f] as number);
      const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
      return { factor: f, short: f.replace("High Market Demand", "Mkt Demand").replace("Lack of Security", "Security"), mean: +mean.toFixed(3) };
    }).sort((a, b) => b.mean - a.mean);
  }, [filtered]);

  const topFactor = factorMeans[0];
  const overall = surveyData.overall as Record<string, { mean: number; interpretation: string; sd: number }>;
  const demo = surveyData.demographics as any;

  const ageData = surveyData.meta.orders.age.map((a) => ({ name: a, value: demo.age[a] || 0 }));
  const sexData = surveyData.meta.orders.sex.map((s) => ({ name: s, value: demo.sex[s] || 0 }));
  const civilData = surveyData.meta.orders.civil.map((c) => ({ name: c, value: demo.civil[c] || 0 }));
  const eduData = surveyData.meta.orders.edu.map((e) => ({ name: e, value: demo.edu[e] || 0 }));

  const likertDist = FACTORS.map((f) => {
    const buckets = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>;
    filtered.forEach((r) => {
      const v = Math.round((r as any)[f]);
      if (buckets[v] !== undefined) buckets[v]++;
    });
    return { factor: f.replace("High Market Demand", "Mkt Demand").replace("Lack of Security", "Security"), SD: buckets[1], D: buckets[2], A: buckets[3], SA: buckets[4] };
  });

  const tests = surveyData.tests as Record<string, Record<string, { test: string; statistic: number; p: number; significant: boolean }>>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <header className="relative border-b border-border/60">
        <div className="absolute inset-0 -z-10 opacity-30" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 -z-10 bg-background/80" />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary text-[11px]">
                CRRDAIS · Mabini Colleges, Inc.
              </Badge>
              <h1 className="font-mono text-xl font-bold tracking-tight sm:text-3xl md:text-4xl leading-tight">
                Cattle Rustling Risk Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-muted-foreground">
                Factors inducing the Anti-Cattle Rustling Law in Barangay Cayucyucan, Mercedes, Camarines Norte.
                Statistical analysis of {surveyData.meta.complete} respondents using weighted means, Mann–Whitney U, and Kruskal–Wallis tests.
              </p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <Select
                  value={demoFilter ? `${demoFilter.key}:${demoFilter.value}` : "all"}
                  onValueChange={(v) => {
                    if (v === "all") setDemoFilter(null);
                    else {
                      const [k, val] = v.split(":");
                      setDemoFilter({ key: k, value: val });
                    }
                  }}
                >
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Filter by demographic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All respondents (no filter)</SelectItem>
                    {(["age", "sex", "civil", "edu"] as const).flatMap((k) =>
                      (surveyData.meta.orders as any)[k].map((v: string) => (
                        <SelectItem key={`${k}:${v}`} value={`${k}:${v}`}>
                          {k.toUpperCase()} · {v}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {demoFilter && (
                <Button variant="ghost" size="sm" onClick={() => setDemoFilter(null)} className="shrink-0">Clear</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8">
        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Respondents" value={filtered.length} sub={`of ${surveyData.meta.complete} total`} icon={<Users />} accent />
          <StatCard label="Top Factor" value={topFactor.short} sub={`x̄ = ${topFactor.mean.toFixed(2)}`} icon={<ShieldAlert />} />
          <StatCard label="Lowest Factor" value={factorMeans[factorMeans.length - 1].short} sub={`x̄ = ${factorMeans[factorMeans.length - 1].mean.toFixed(2)}`} icon={<TrendingUp />} />
          <StatCard label="Composite Mean" value={(factorMeans.reduce((a, b) => a + b.mean, 0) / factorMeans.length).toFixed(2)} sub="Likert 1–4 scale" icon={<Activity />} />
        </section>

        {/* Factor weighted means */}
        <section className="grid gap-4 lg:grid-cols-3">
          <ChartCard
            title="Weighted Mean per Factor"
            description="Sorted by perceived strength. Bands: 1–1.74 SD, 1.75–2.49 D, 2.50–3.24 A, 3.25–4 SA."
            className="lg:col-span-2"
          >
            <div className="w-full overflow-x-auto">
              <div className="min-w-[320px]">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={factorMeans} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="short" stroke="var(--muted-foreground)" fontSize={11} tick={{ fontSize: 10 }} />
                    <YAxis domain={[1, 4]} stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [v.toFixed(3), "Weighted mean"]}
                    />
                    <Bar dataKey="mean" radius={[6, 6, 0, 0]}>
                      {factorMeans.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-3 grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {factorMeans.map((f) => {
                const it = interpret(f.mean);
                return (
                  <div key={f.factor} className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
                    <span className="text-xs font-medium truncate mr-2">{f.factor}</span>
                    <Badge variant="outline" className={`font-mono text-[10px] shrink-0 ${it.tone}`}>{f.mean.toFixed(2)} · {it.label}</Badge>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard title="Factor Profile" description="Radar of weighted means (filtered cohort).">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[260px]">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={factorMeans}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="short" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[1, 4]} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
                    <Radar name="Mean" dataKey="mean" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ChartCard>
        </section>

        {/* Likert distribution */}
        <ChartCard title="Likert Response Distribution" description="Stacked counts across the 4-point scale per factor.">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[320px]">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={likertDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="factor" stroke="var(--muted-foreground)" fontSize={11} tick={{ fontSize: 10 }} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="SD" stackId="a" fill="var(--chart-4)" name="Strongly Disagree" />
                  <Bar dataKey="D" stackId="a" fill="var(--chart-5)" name="Disagree" />
                  <Bar dataKey="A" stackId="a" fill="var(--chart-2)" name="Agree" />
                  <Bar dataKey="SA" stackId="a" fill="var(--chart-1)" name="Strongly Agree" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* Demographics */}
        <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <DemoCard title="Age" data={ageData} />
          <DemoCard title="Sex" data={sexData} />
          <DemoCard title="Civil Status" data={civilData} />
          <DemoCard title="Education" data={eduData} />
        </section>

        {/* Means by demographic */}
        <ChartCard title="Mean Factor Score by Demographic" description="Compare factor perception across subgroups.">
          <Tabs defaultValue="age">
            <TabsList className="flex flex-wrap h-auto gap-1 sm:flex-nowrap">
              <TabsTrigger value="age" className="text-xs sm:text-sm">Age</TabsTrigger>
              <TabsTrigger value="sex" className="text-xs sm:text-sm">Sex</TabsTrigger>
              <TabsTrigger value="civil" className="text-xs sm:text-sm">Civil Status</TabsTrigger>
              <TabsTrigger value="edu" className="text-xs sm:text-sm">Education</TabsTrigger>
            </TabsList>
            {(["age", "sex", "civil", "edu"] as const).map((k) => {
              const means = (surveyData.means as any)[k] as Record<string, Record<string, number>>;
              const order = (surveyData.meta.orders as any)[k] as string[];
              const data = order.filter((g) => means[g]).map((g) => ({ group: g, ...means[g] }));
              return (
                <TabsContent key={k} value={k}>
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[320px]">
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="group" stroke="var(--muted-foreground)" fontSize={10} tick={{ fontSize: 10 }} />
                          <YAxis domain={[1, 4]} stroke="var(--muted-foreground)" fontSize={11} />
                          <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          {FACTORS.map((f, i) => (
                            <Line key={f} type="monotone" dataKey={f} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </ChartCard>

        {/* Inferential tests */}
        <ChartCard
          title="Inferential Statistics"
          description="Mann–Whitney U for sex (2 groups); Kruskal–Wallis H for age, civil status, education. Significance threshold α = 0.05."
        >
          <div className="overflow-x-auto -mx-1">
            <div className="min-w-[480px] px-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Factor</TableHead>
                    <TableHead className="text-center text-xs">Sex (U)</TableHead>
                    <TableHead className="text-center text-xs">Age (H)</TableHead>
                    <TableHead className="text-center text-xs">Civil (H)</TableHead>
                    <TableHead className="text-center text-xs">Education (H)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FACTORS.map((f) => (
                    <TableRow key={f}>
                      <TableCell className="font-medium text-xs">{f}</TableCell>
                      {(["sex", "age", "civil", "edu"] as const).map((k) => {
                        const t = tests[f]?.[k];
                        if (!t) return <TableCell key={k} className="text-center text-muted-foreground text-xs">—</TableCell>;
                        return (
                          <TableCell key={k} className="text-center">
                            <div className="font-mono text-xs">{t.statistic.toFixed(2)}</div>
                            <Badge
                              variant="outline"
                              className={`mt-1 font-mono text-[10px] ${t.significant ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"}`}
                            >
                              p={t.p.toFixed(4)} {t.significant ? "·sig" : "·n.s."}
                            </Badge>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ChartCard>

        {/* Missing-data audit */}
        <ChartCard
          title="Missing-Data Audit"
          description="Transparency on which rows were excluded from statistical analysis and why."
        >
          {(() => {
            const m = (surveyData as any).missing as {
              totalSurveyed: number; analyzed: number; excluded: number;
              reason: string; byFactor: Record<string, number> | null; note: string;
            };
            return (
              <div className="space-y-4">
                <div className="grid gap-3 grid-cols-3">
                  <div className="rounded-md border border-border bg-muted/40 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total</p>
                    <p className="font-mono text-xl sm:text-2xl font-semibold">{m.totalSurveyed}</p>
                  </div>
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Analyzed</p>
                    <p className="font-mono text-xl sm:text-2xl font-semibold text-primary">{m.analyzed}</p>
                  </div>
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Excluded</p>
                    <p className="font-mono text-xl sm:text-2xl font-semibold text-destructive">{m.excluded}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{m.reason}</span>
                </div>
                {m.byFactor ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Blank sub-items per factor</p>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {FACTORS.map((f) => (
                        <div key={f} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                          <span className="text-xs font-medium truncate mr-2">{f}</span>
                          <Badge
                            variant="outline"
                            className={`font-mono text-[10px] shrink-0 ${(m.byFactor![f] ?? 0) > 0 ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border text-muted-foreground"}`}
                          >
                            {m.byFactor![f] ?? 0} blank
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })()}
        </ChartCard>

        {/* Raw data */}
        <ChartCard title="Respondent Records" description={`Showing all ${filtered.length} filtered records.`}>
          <div className="max-h-[400px] sm:max-h-[600px] overflow-auto rounded-md border border-border/60 -mx-1">
            <div className="min-w-[600px] px-1">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Age</TableHead>
                    <TableHead className="text-xs">Sex</TableHead>
                    <TableHead className="text-xs">Civil</TableHead>
                    <TableHead className="text-xs">Education</TableHead>
                    {FACTORS.map((f) => (
                      <TableHead key={f} className="text-right text-xs">{f.split(" ")[0]}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="text-xs">{r.age}</TableCell>
                      <TableCell className="text-xs">{r.sex}</TableCell>
                      <TableCell className="text-xs">{r.civil}</TableCell>
                      <TableCell className="text-xs">{r.edu}</TableCell>
                      {FACTORS.map((f) => (
                        <TableCell key={f} className="text-right font-mono text-xs">{((r as any)[f] as number).toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ChartCard>

        <footer className="border-t border-border/60 pt-6 pb-safe text-center text-xs text-muted-foreground">
          Dataset: 316 respondents · Sept 2025 – Mar 2026 · Likert 1–4 · Computed with weighted mean, Mann–Whitney U, Kruskal–Wallis H.
        </footer>
      </main>
    </div>
  );
}

function DemoCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <ChartCard title={title} description={`n = ${total}`}>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[120px]">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={30} outerRadius={55} paddingAngle={2}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="truncate max-w-[80px] sm:max-w-none">{d.name}</span>
            </span>
            <span className="font-mono text-muted-foreground ml-1 shrink-0">{d.value} · {((d.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
