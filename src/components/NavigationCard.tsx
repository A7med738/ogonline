import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavigationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  badge?: React.ReactNode;
  color?: string;
}

export const NavigationCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  className,
  style,
  badge,
  color = "from-emerald-500 to-cyan-500"
}: NavigationCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className={cn(
        "relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group",
        `bg-gradient-to-br ${color}`
      )}>
        <CardContent className="p-3 sm:p-4 text-center">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
          >
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </motion.div>
          <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight">
            {title}
          </h3>
          {badge && (
            <div className="absolute top-1 right-1">
              {badge}
            </div>
          )}
          
          {/* Hover effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                →
              </motion.div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};