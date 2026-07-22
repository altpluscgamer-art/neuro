import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "accent";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-sm",
  secondary:
    "border border-primary-300 bg-white text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-500",
  accent:
    "bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-500 shadow-sm",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-lg",
};

type ButtonBaseProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "href"> & { href?: undefined };

type ButtonAsLink = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = "primary",
      size = "md",
      loading = false,
      className,
      children,
      ...rest
    } = props;

    const classes = clsx(
      "inline-flex items-center justify-center gap-2 font-semibold transition-[color,transform] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variantStyles[variant],
      sizeStyles[size],
      loading && "pointer-events-none opacity-70",
      className
    );

    if ("href" in rest && rest.href !== undefined) {
      const { href, ...linkRest } = rest as ButtonAsLink;
      return (
        <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={classes} {...linkRest}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </Link>
      );
    }

    const buttonRest = rest as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={buttonRest.type ?? "button"}
        className={classes}
        disabled={loading || buttonRest.disabled}
        {...buttonRest}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
