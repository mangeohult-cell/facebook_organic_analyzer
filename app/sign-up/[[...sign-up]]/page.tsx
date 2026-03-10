import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#303942] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">
          Facebook <span className="text-[#ED5821]">Organic</span> Analyzer
        </h1>
        <p className="text-white/60 mt-2 text-sm">Skapa konto</p>
      </div>
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#ED5821",
            colorBackground: "#ffffff",
            borderRadius: "8px",
            fontFamily: "Outfit, sans-serif",
          },
        }}
      />
    </div>
  );
}
