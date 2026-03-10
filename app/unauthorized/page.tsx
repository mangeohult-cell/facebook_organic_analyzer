import { SignOutButton } from '@clerk/nextjs'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm p-10 max-w-md text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          🔒
        </div>
        <h1 className="text-xl font-bold text-[#303942] mb-2">Ingen behörighet</h1>
        <p className="text-gray-500 text-sm mb-6">
          Din e-postadress finns inte i teamets whitelist. Kontakta din administratör för att få tillgång.
        </p>
        <SignOutButton>
          <button className="bg-[#ED5821] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#d94d1d] transition-colors">
            Logga ut
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}
