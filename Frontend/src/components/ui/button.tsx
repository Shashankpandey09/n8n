import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
   
        default:
          "bg-[#2563EB] text-white hover:bg-[#1e40af] shadow-sm border-transparent",

        destructive:
          "bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-sm border-transparent",

       
        outline:
          "border border-[#2b2f35] bg-transparent text-[#d1d5db] hover:bg-[#0b1014] hover:border-[#3b4148]",

      
        secondary:
          "bg-[#0f1720] text-[#cbd5e1] hover:bg-[#0b1220] border border-[#1f2328]",


        ghost:
          "bg-transparent text-[#cbd5e1] hover:bg-[#0b1014] hover:text-[#ffffff]",

     
        link: "text-[#60a5fa] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
