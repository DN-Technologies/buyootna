"use client";

import { Download, Terminal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { chrome } from "@/lib/chrome";

export function PostmanView() {
  const { lang } = useLanguage();
  const c = chrome[lang];

  const steps = [
    { title: c.postmanStep1Title, body: c.postmanStep1Body },
    { title: c.postmanStep2Title, body: c.postmanStep2Body },
    { title: c.postmanStep3Title, body: c.postmanStep3Body },
    { title: c.postmanStep4Title, body: c.postmanStep4Body },
    { title: c.postmanStep5Title, body: c.postmanStep5Body },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{c.postmanTitle}</h1>
        <p className="mt-2 max-w-2xl text-[#B9C3CC]">
          {c.postmanDescriptionPre}
          <code dir="ltr" className="text-accent-light">
            {c.postmanDescriptionCode}
          </code>
          {c.postmanDescriptionPost}
        </p>
      </div>

      <a
        href="/buyootna-api.postman_collection.json"
        download
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0A1118] transition-colors hover:bg-accent-light"
      >
        <Download className="h-4 w-4 flex-none" />
        {c.postmanDownload}
      </a>

      <div className="rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 p-6">
        <div className="flex items-center gap-2 text-accent">
          <Terminal className="h-4 w-4" />
          <h2 className="text-xs font-semibold uppercase tracking-wider">
            {c.postmanSetupTitle}
          </h2>
        </div>
        <ol className="mt-4 space-y-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span
                dir="ltr"
                className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-accent-light"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{step.title}</p>
                <p className="mt-0.5 text-sm text-[#B9C3CC]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-dashed border-[#2A3A47] p-5">
        <p className="text-sm text-[#B9C3CC]">
          <span className="font-semibold text-white">
            {c.postmanSyncNoteBold}
          </span>
          {c.postmanSyncNotePrefix}
          <code dir="ltr" className="text-accent-light">
            {c.postmanSyncNoteScript}
          </code>
          {c.postmanSyncNoteMid}
          <code dir="ltr" className="text-accent-light">
            {c.postmanSyncNoteCommand}
          </code>
          {c.postmanSyncNoteSuffix}
        </p>
      </div>
    </div>
  );
}
