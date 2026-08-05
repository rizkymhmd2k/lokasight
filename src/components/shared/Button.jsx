export default function Button({
  children,
  className = "",
  href,
  ...props
}) {
  const content = (
    <span className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.08em]">
      <span>{children}</span>
      <span className="relative flex h-4 w-5 overflow-hidden">
        <span className="absolute inset-0 transition-transform duration-300 ease-out group-hover:translate-x-full">
          →
        </span>
        <span className="absolute inset-0 -translate-x-full transition-transform duration-300 ease-out group-hover:translate-x-0">
          →
        </span>
      </span>
    </span>
  );
  const classes = `group inline-flex rounded-md bg-black px-5 py-3 text-[#F8F7F3] sm:px-4 sm:py-2.5 ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}
