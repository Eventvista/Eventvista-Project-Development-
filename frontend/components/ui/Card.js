export default function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}