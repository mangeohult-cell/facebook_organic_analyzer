interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-md transition-opacity disabled:opacity-50";

  const variants = {
    primary: "bg-[#ED5821] text-white hover:opacity-90",
    secondary: "bg-[#CDAC50] text-white hover:opacity-90",
    ghost: "bg-transparent text-[#303942] hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
