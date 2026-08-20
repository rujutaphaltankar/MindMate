export default function FormField({ label, type = "text", value, onChange, name, placeholder, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-dusk-700 dark:text-dusk-200">
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
        className="w-full rounded-2xl border border-dusk-200 bg-white px-4 py-2.5 text-dusk-900 placeholder:text-dusk-300 outline-none transition focus:border-dusk-400 focus:ring-4 focus:ring-dusk-100 dark:border-dusk-700 dark:bg-dusk-800 dark:text-dusk-50 dark:focus:ring-dusk-800"
      />
    </label>
  );
}
