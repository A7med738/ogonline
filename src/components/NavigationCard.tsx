import { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
interface NavigationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  badge?: React.ReactNode;
}
export const NavigationCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  className,
  style,
  badge
}: NavigationCardProps) => {
  return <GlassCard className={cn("cursor-pointer group hover:scale-[1.02] transition-all duration-500 active:scale-[0.98] p-4 pt-6", "hover:shadow-xl hover:shadow-primary/20 border-white/10 hover:border-primary/30", "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100", "relative overflow-hidden aspect-square max-w-36 md:max-w-32", className)} onClick={onClick} style={style}>
      <div className="flex flex-col items-center justify-center h-full relative z-10">
        <div className="relative group/icon mb-3 mt-1 md:mt-0 flex items-center justify-center">
          <div className="bg-gradient-to-br from-green-500 via-green-400 to-green-600 p-3 rounded-xl shadow-lg group-hover:shadow-green-500/30 transition-all duration-300">
            <Icon className="h-4 w-4 text-white drop-shadow-sm" />
          </div>
          <div className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-br from-primary via-primary-glow to-primary rounded-xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500"></div>
          {badge}
        </div>
        <div className="text-center px-1">
          <h6 className="text-xs font-semibold text-foreground/90 mb-1 group-hover:text-primary transition-colors duration-300 leading-tight">
            {title}
          </h6>
          
        </div>
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full"></div>
    </GlassCard>;
};