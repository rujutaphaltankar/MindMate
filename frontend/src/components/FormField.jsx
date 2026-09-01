export default function FormField({ label, type = "text", value, onChange, name, placeholder, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-dusk-600 dark:text-dusk-400">
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="
          w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-200
          bg-white border border-dusk-200 text-dusk-900 placeholder:text-dusk-400
          focus:border-sage-500 focus:ring-2 focus:ring-sage-500/20 hover:border-dusk-300
          dark:bg-white/5 dark:border-white/8 dark:text-white dark:placeholder:text-dusk-600
          dark:focus:border-sage-500/60 dark:focus:bg-white/8 dark:hover:border-white/15
        "
      />
    </label>
  );
}
