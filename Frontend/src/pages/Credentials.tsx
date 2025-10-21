import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Fields = Record<string, string>;
const STORAGE_KEY = "app.credentials.royal.responsive";
const ROYAL = "#0b54d4"; // royal blue accent

const prettyJson = (o: any) => {
  try {
    return JSON.stringify(o, null, 2);
  } catch {
    return String(o);
  }
};

const DEFAULT_FIELDS = { username: "", apiKey: "" } as Fields;

export default function CredentialsPage(): JSX.Element {
  const [name, setName] = useState("");
  const [fields, setFields] = useState<Fields>({ ...DEFAULT_FIELDS });
  const [credentials, setCredentials] = useState<Record<string, Fields>>({});
  const [query, setQuery] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [showListOnMobile, setShowListOnMobile] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCredentials(JSON.parse(raw));
    } catch (e) {
      console.warn("load error", e);
    }
  }, []);

  const keys = useMemo(() => Object.keys(credentials), [credentials]);
  const filtered = useMemo(() => keys.filter((k) => k.toLowerCase().includes(query.trim().toLowerCase())), [keys, query]);

  const saveAll = (next: Record<string, Fields>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setCredentials(next);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save");
    }
  };

  const resetForm = () => {
    setName("");
    setFields({ ...DEFAULT_FIELDS });
    setEditingKey(null);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const n = name.trim();
    if (!n) return toast.error("Credential name is required");
    if (!editingKey && credentials[n]) return toast.error("A credential with this name already exists");
    const next = { ...credentials, [n]: { ...fields } };
    saveAll(next);
    toast.success(editingKey ? "Updated" : "Saved");
    resetForm();
  };

  const handleEdit = (k: string) => {
    setEditingKey(k);
    setName(k);
    setFields({ ...credentials[k] });
    // on mobile show editor and hide list
    setShowListOnMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (k: string) => {
    if (!confirm(`Delete credential "${k}"?`)) return;
    const { [k]: _removed, ...rest } = credentials;
    saveAll(rest);
    toast.success("Deleted");
  };

  const handleCopy = async (k: string) => {
    try {
      await navigator.clipboard.writeText(prettyJson({ name: k, fields: credentials[k] }));
      toast.success("Copied");
    } catch (e) {
      toast.error("Copy failed");
    }
  };

  const addField = () => {
    let i = 1;
    let key = "key" + i;
    while (fields[key]) {
      i += 1;
      key = "key" + i;
    }
    setFields((s) => ({ ...s, [key]: "" }));
  };

  const updateFieldKey = (oldKey: string, newKey: string) => {
    const nk = newKey.trim();
    if (!nk) return;
    if (nk === oldKey) return;
    setFields((s) => {
      if (s[nk]) return s;
      const next: Fields = {};
      Object.keys(s).forEach((k) => (next[k === oldKey ? nk : k] = s[k]));
      return next;
    });
  };

  const updateFieldValue = (k: string, v: string) => setFields((s) => ({ ...s, [k]: v }));
  const removeField = (k: string) => setFields((s) => {
    const { [k]: _r, ...rest } = s;
    return rest;
  });

  const exportAll = async () => {
    try {
      await navigator.clipboard.writeText(prettyJson(credentials));
      toast.success("Exported");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const clearAll = () => {
    if (!confirm("Clear all credentials?")) return;
    saveAll({});
    toast.success("Cleared");
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      {/* full-bleed header */}
      <header className="w-full py-4 px-4 md:px-8 flex items-center justify-between border-b sticky top-0 z-20 bg-white" style={{ borderColor: "#e6eefc" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: ROYAL }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12h18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 6h18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold" style={{ color: ROYAL }}>Credentials</h1>
            <p className="text-xs text-slate-500">Manage API keys and secrets — royal blue & white.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <input className="px-3 py-2 rounded border placeholder:text-slate-400 w-56" placeholder="Quick search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {/* mobile search collapsed */}
          <div className="sm:hidden">
            <input className="px-3 py-2 rounded border placeholder:text-slate-400 w-40" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <button onClick={() => setShowListOnMobile((s) => !s)} className="sm:hidden px-3 py-2 rounded border" style={{ borderColor: ROYAL, color: ROYAL }}>
            {showListOnMobile ? "Hide list" : "Show list"}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <button onClick={exportAll} className="px-3 py-2 rounded border" style={{ borderColor: ROYAL, color: ROYAL }}>Export</button>
            <button onClick={clearAll} className="px-3 py-2 rounded bg-red-600 text-white">Clear</button>
          </div>
        </div>
      </header>

      <main className="w-full p-4 md:p-8">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Editor area - full width on mobile */}
          <section className={`md:col-span-8 ${showListOnMobile ? "hidden" : "block"}`}>
            <Card className="shadow rounded-lg h-full">
              <CardHeader className="flex items-center justify-between py-4 px-4 md:px-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: ROYAL }} />
                  <CardTitle className="text-base md:text-lg">{editingKey ? "Edit Credential" : "Add Credential"}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { resetForm(); toast.success('Cleared'); }} className="px-2 py-1 rounded border text-sm md:text-base" style={{ borderColor: ROYAL, color: ROYAL }}>Clear</button>
                  <button onClick={handleSave as any} className="px-3 py-1.5 rounded text-white text-sm md:text-base" style={{ background: ROYAL }}>{editingKey ? "Update" : "Save"}</button>
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-6">
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <Label className="text-sm">Credential name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SendGrid / SMTP / Twilio" className="mt-2" />
                  </div>

                  <div>
                    <Label className="text-sm">Fields (key → value)</Label>
                    <div className="mt-3 space-y-2">
                      {Object.keys(fields).length === 0 && <div className="text-sm text-slate-500">No fields — add one below.</div>}

                      {Object.keys(fields).map((k) => (
                        <div key={k} className="grid grid-cols-12 gap-2 items-center">
                          <Input value={k} onChange={(e) => updateFieldKey(k, e.target.value)} className="col-span-12 sm:col-span-4" />
                          <Input value={fields[k]} onChange={(e) => updateFieldValue(k, e.target.value)} className="col-span-12 sm:col-span-7" />
                          <button type="button" onClick={() => removeField(k)} className="col-span-12 sm:col-span-1 inline-flex items-center justify-center h-9 rounded bg-red-600 text-white">Del</button>
                        </div>
                      ))}

                      <div className="flex gap-3">
                        <button type="button" onClick={addField} className="px-3 py-2 rounded border text-sm" style={{ borderColor: ROYAL, color: ROYAL }}>+ Add field</button>
                        <button type="button" onClick={() => { setFields({ host: "smtp.example.com", port: "587", user: "user@example.com", pass: "" }); toast.success('Sample inserted'); }} className="px-3 py-2 rounded border text-sm" style={{ borderColor: ROYAL, color: ROYAL }}>Sample</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Preview</Label>
                    <pre className="mt-2 p-3 rounded bg-[#0b2a66] text-white text-xs max-h-48 overflow-auto">{prettyJson(fields)}</pre>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-3">
                <div className="text-sm text-slate-600">Pro tip: Use descriptive names and avoid sharing secrets.</div>
              </Card>
              <Card className="p-3">
                <div className="text-sm text-slate-600">You can export credentials using the export button in the header.</div>
              </Card>
              <Card className="p-3">
                <div className="text-sm text-slate-600">Theme: <span style={{ color: ROYAL }}>Royal blue</span></div>
              </Card>
            </div>
          </section>

          {/* Right: list - collapses under editor on mobile */}
          <aside className={`md:col-span-4 ${showListOnMobile ? "block" : "block md:block"}`}>
            <Card className="h-full shadow rounded-lg">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base">Saved Credentials</CardTitle>
              </CardHeader>
              <CardContent className="p-3 overflow-auto max-h-[60vh] md:max-h-[calc(100vh-220px)] space-y-3">
                {filtered.length === 0 && <div className="text-sm text-slate-500">No credentials</div>}

                {filtered.map((k) => (
                  <motion.div key={k} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="border rounded p-3" style={{ borderColor: '#e6eefc' }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="font-medium" style={{ color: ROYAL }}>{k}</div>
                        <div className="text-xs text-slate-500 mt-1">{Object.keys(credentials[k] || {}).length} fields</div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(k)} className="px-3 py-1 rounded border text-sm" style={{ borderColor: ROYAL, color: ROYAL }}>Edit</button>
                        <button onClick={() => handleCopy(k)} className="px-3 py-1 rounded bg-white border text-sm" style={{ borderColor: ROYAL, color: ROYAL }}>Copy</button>
                        <button onClick={() => handleDelete(k)} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Delete</button>
                      </div>

                    </div>

                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-slate-600">Show fields</summary>
                      <pre className="mt-2 p-2 bg-[#f6f9ff] rounded text-[12px] max-h-40 overflow-auto">{prettyJson(credentials[k])}</pre>
                    </details>
                  </motion.div>
                ))}

                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-2 rounded border text-sm" style={{ borderColor: ROYAL, color: ROYAL }} onClick={exportAll}>Export</button>
                  <button className="px-3 py-2 rounded bg-white border text-sm" style={{ borderColor: ROYAL, color: ROYAL }} onClick={clearAll}>Clear all</button>
                </div>
              </CardContent>
            </Card>

            <div className="text-xs text-slate-500 mt-2">Tip: Use the search box in the header for quick filtering.</div>
          </aside>
        </div>
      </main>
    </div>
  );
}
