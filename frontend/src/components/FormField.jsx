export default function FormField({ label, type = "text", value, onChange, name, placeholder, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-dusk-400">
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
          w-full rounded-2xl px-4 py-3 text-sm text-white placeholder:text-dusk-600
          outline-none transition-all duration-200
          bg-white/5 border border-white/8
          focus:border-sage-500/60 focus:bg-white/8 focus:ring-2 focus:ring-sage-500/20
          hover:border-white/15
        "
      />
    </label>
  );
}
