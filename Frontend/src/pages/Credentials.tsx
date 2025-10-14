import React, { useEffect, useState } from 'react'
// import { useCredStore } from '@/store/CredStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const CredentialsPage: React.FC = () => {
//   const loadFromLocal = useCredStore((s) => s.loadFromLocalStorage)
//   const saveToLocal = useCredStore((s) => s.saveToLocalStorage)
//   const createCredential = useCredStore((s) => s.createCredential)
//   const removeCredential = useCredStore((s) => s.removeCredential)
//   const credentials = useCredStore((s) => s.credentials)
//   const loadFromBackend = useCredStore((s) => s.loadFromBackend)

//   const [name, setName] = useState('')
//   const [fields, setFields] = useState<Record<string, any>>({})

//   useEffect(() => {
//     loadFromLocal()
//     loadFromBackend()
//   }, [])

//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!name) return toast.error('Name required')
//     try {
//       await createCredential(name, fields)
//       toast.success('Saved credential')
//       setName('')
//       setFields({})
//     } catch (e) {
//       toast.error('Failed to save credential')
//     }
//   }

  return (
    <></>
    // <div className="p-6">
    //   <h2 className="text-xl mb-4">Credentials</h2>
    //   <div className="grid grid-cols-2 gap-4">
    //     <Card>
    //       <CardHeader>
    //         <CardTitle>Add / Edit</CardTitle>
    //       </CardHeader>
    //       <CardContent>
    //         <form onSubmit={handleSave} className="space-y-3">
    //           <div>
    //             <Label className="text-sm">Credential Name</Label>
    //             <Input value={name} onChange={(e) => setName(e.target.value)} />
    //           </div>

    //           {/* free-form fields: user can add keys in UI; for simplicity, use CSV key=value pairs */}
    //           <div>
    //             <Label className="text-sm">Fields (JSON or key=value lines)</Label>
    //             <textarea
    //               value={Object.entries(fields).map(([k, v]) => `${k}=${v}`).join('\n')}
    //               onChange={(e) => {
    //                 const lines = e.target.value.split('\n')
    //                 const obj: Record<string, any> = {}
    //                 lines.forEach((l) => {
    //                   const idx = l.indexOf('=')
    //                   if (idx !== -1) {
    //                     const k = l.slice(0, idx).trim()
    //                     const v = l.slice(idx + 1).trim()
    //                     if (k) obj[k] = v
    //                   }
    //                 })
    //                 setFields(obj)
    //               }}
    //               className="w-full rounded-md border p-2"
    //               rows={6}
    //             />
    //           </div>

    //           <div className="flex gap-2">
    //             <Button type="submit">Save</Button>
    //             <Button variant="ghost" onClick={() => { saveToLocal(); toast.success('Saved to local') }}>Save local</Button>
    //           </div>
    //         </form>
    //       </CardContent>
    //     </Card>

    //     <Card>
    //       <CardHeader>
    //         <CardTitle>Saved Credentials</CardTitle>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="space-y-2">
    //           {Object.keys(credentials).length === 0 && <p>No credentials saved</p>}
    //           {Object.entries(credentials).map(([k, v]) => (
    //             <div key={k} className="flex items-center justify-between border rounded p-2">
    //               <div>
    //                 <div className="font-medium">{k}</div>
    //                 <pre className="text-xs">{JSON.stringify(v)}</pre>
    //               </div>
    //               <div className="flex gap-2">
    //                 <Button onClick={() => {
    //                   // apply to clipboard or navigate to builder
    //                   navigator.clipboard.writeText(JSON.stringify({ name: k, fields: v }))
    //                   toast.success('Copied to clipboard')
    //                 }}>Copy</Button>
    //                 <Button variant="destructive" onClick={() => { removeCredential(k); toast.success('Removed') }}>Delete</Button>
    //               </div>
    //             </div>
    //           ))}
    //         </div>
    //       </CardContent>
    //     </Card>
    //   </div>
    // </div>
  )
}

export default CredentialsPage