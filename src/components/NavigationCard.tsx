import { LucideIcon } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

interface NavigationCardProps {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
  className?: string
  style?: React.CSSProperties
}

export const NavigationCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  className,
  style 
}: NavigationCardProps) => {
  return (
    <GlassCard 
      className={cn(
        "cursor-pointer group hover:scale-105 transition-all duration-300 active:scale-95",
        className
      )} 
      onClick={onClick}
      style={style}
    >
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="bg-gradient-primary p-3 rounded-xl group-hover:shadow-elegant transition-all duration-300">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </GlassCard>
  )
}