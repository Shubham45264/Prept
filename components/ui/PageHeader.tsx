interface PageHeaderProps {
  label: string;
  gray: string;
  gold: string;
  description?: string;
}

export default function PageHeader({
  label,
  gray,
  gold,
  description,
}: PageHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <p className="text-yellow-500 uppercase tracking-widest text-sm font-semibold mb-3">
        {label}
      </p>

      <h1 className="text-4xl md:text-5xl font-bold">
        <span className="text-gray-200">{gray} </span>
        <span className="text-yellow-500">{gold}</span>
      </h1>

      {description && (
        <p className="mt-4 max-w-2xl text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}