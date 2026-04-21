import HarapanTimer from './components/HarapanTimer';

export default function Home() {
  const positions = [
    "Chairperson & Student Regent",
    "Internal Vice Chairperson",
    "External Vice Chairperson",
    "Secretary-General",
    "Deputy Secretary-General",
    "Finance Officer",
    "Deputy Finance Officer",
    "Auditor",
    "Business Manager",
    "Public Information Officer"
  ];

  const times = [
    { label: "5 Minutes (Chair/Indep)", seconds: 300 },
    { label: "3 Minutes (Speech)", seconds: 180 },
    { label: "90 Seconds (Answer)", seconds: 90 },
    { label: "60 Seconds (Rebuttal)", seconds: 60 },
    { label: "30 Seconds (Response)", seconds: 30 },
  ];

  return (
    <HarapanTimer 
      logoSrc="/harapan-2026-logo.png"
      themeColor="#467c64"
      positions={positions}
      presets={times}
      warningThreshold={15}
    />
  );
}
