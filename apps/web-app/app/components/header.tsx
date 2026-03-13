export default function Header({ active }: { active: string }) {
  return (
    <header className="mb-5 flex-none">
      <h1 className="text-[42px] leading-none font-semibold tracking-tight text-zinc-900">
        {active === "Dashboard"
          ? "Dashboard"
          : active === "Students List"
            ? "Students List"
            : active === "Sections"
              ? "Section List"
              : "Attendance"}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {active === "Dashboard"
          ? "University attendance overview (3-day event)."
          : active === "Students List"
            ? "Manage students and attendance."
            : active === "Sections"
              ? "Create and manage sections."
              : "Review attendance records by section."}
      </p>
    </header>
  );
}
