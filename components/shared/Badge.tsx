interface BadgeProps {
  variant?: "ockra" | "vallmo" | "gray" | "warning";
  children: React.ReactNode;
}

export default function Badge({ variant = "ockra", children }: BadgeProps) {
  const styles = {
    ockra: "bg-[#CDAC50] text-white",
    vallmo: "bg-[#ED5821] text-white",
    gray: "bg-gray-100 text-gray-600",
    warning: "bg-orange-100 text-orange-700",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
