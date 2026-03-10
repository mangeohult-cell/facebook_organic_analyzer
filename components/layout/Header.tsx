"use client";

import { UserButton, useUser } from "@clerk/nextjs";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useUser();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-xl font-semibold text-[#303942]">{title}</h1>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-gray-600 hidden sm:block">
            {user.firstName ?? user.emailAddresses[0]?.emailAddress}
          </span>
        )}
        <UserButton
          appearance={{
            variables: { colorPrimary: "#ED5821" },
          }}
        />
      </div>
    </header>
  );
}
