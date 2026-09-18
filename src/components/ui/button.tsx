import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/95 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-destructive/25",
        outline: "border border-input bg-background hover:bg-secondary/90 hover:text-primary hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:-translate-y-0.5 hover:shadow-md",
        ghost: "hover:bg-secondary/90 hover:text-foreground hover:-translate-y-0.5 hover:shadow-xs",
        link: "text-primary underline-offset-4 hover:underline hover:scale-[1.02]",
        hero: "bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/95 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]",
        accent: "bg-accent text-accent-foreground font-semibold hover:bg-accent/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25",
        success: "bg-success text-success-foreground font-semibold shadow-sm hover:bg-success/95 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-success/25",
        "outline-hero": "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10 hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
