// frontend/components/ui/Button.js
const VARIANTS = {
  primary: "bg-purple-600 text-white hover:bg-purple-700",
  secondary: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
  ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100",
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}