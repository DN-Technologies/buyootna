import { AlertTriangle } from "lucide-react";
import { appVersions } from "@/data/versions";

export default function VersionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">App Versions</h1>
        <p className="mt-2 max-w-2xl text-[#B9C3CC]">
          Current version per platform, sourced from each app's
          package.json/app.json. This is what QA should be testing against
          right now.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#1B2936]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0F1E2E] text-xs uppercase tracking-wider text-[#7C8894]">
            <tr>
              <th className="px-4 py-3">App</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B2936]">
            {appVersions.map((app) => (
              <tr key={app.packageName} className="align-top">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{app.name}</div>
                  <div className="text-xs text-[#7C8894]">{app.packageName}</div>
                </td>
                <td className="px-4 py-3 font-mono text-accent-light">
                  {app.version}
                </td>
                <td className="px-4 py-3 text-[#B9C3CC]">{app.platform}</td>
                <td className="px-4 py-3 text-[#B9C3CC]">{app.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 rounded-2xl border border-dashed border-[#5A4A26] bg-[#3A2E14]/30 p-5">
        <AlertTriangle className="h-5 w-5 flex-none text-[#E0B96B]" />
        <p className="text-sm text-[#DCE1E6]">
          <span className="font-semibold text-white">
            Versions aren't currently bumped per release
          </span>{" "}
          — every web app sits at the Next.js scaffold default (0.1.0) and the
          API at 0.0.1, while only the mobile app's version (1.1.0) reflects
          real app-store submissions. Because the CD pipeline deploys straight
          from <code className="text-accent-light">main</code> on every push,
          the git commit SHA at deploy time is the actual source of truth for
          "what's in production" for the API and web apps — reference that
          commit (not this table) when filing a bug against a specific web/API
          build. Recommend adopting real semver bumps (or at least deploy-time
          commit tagging visible in the UI) if precise build-to-bug-report
          traceability becomes a priority.
        </p>
      </div>
    </div>
  );
}
