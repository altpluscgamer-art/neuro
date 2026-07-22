import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-gray-500">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          {item.href ? (
            <Link href={item.href} className="hover:text-primary-600 transition-colors">{item.label}</Link>
          ) : (
            <span className="font-medium text-gray-700">{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight className="h-3 w-3 text-gray-400" />}
        </div>
      ))}
    </nav>
  );
}
