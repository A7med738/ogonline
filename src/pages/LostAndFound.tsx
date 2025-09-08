import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Search, PackageSearch } from "lucide-react";

const LostAndFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h3 className="md:text-2xl text-xl font-bold text-foreground">مفقودات وموجودات</h3>
          <p className="text-muted-foreground text-sm mt-2">اختر نوع البلاغ</p>
        </div>

        <div className="max-w-xl mx-auto grid gap-4">
          <GlassCard className="p-4">
            <Button
              className="w-full h-14 text-base"
              onClick={() => navigate("/services/lost-and-found/view-all")}
            >
              <Search className="w-5 h-5 ml-2" /> عرض المفقودات والموجودات
            </Button>
          </GlassCard>

          <GlassCard className="p-4">
            <Button
              className="w-full h-14 text-base"
              variant="outline"
              onClick={() => navigate("/services/lost-and-found/report-lost")}
            >
              <PackageSearch className="w-5 h-5 ml-2" /> أبلغ عن شيء مفقود
            </Button>
          </GlassCard>

          <GlassCard className="p-4">
            <Button
              className="w-full h-14 text-base"
              variant="outline"
              onClick={() => navigate("/services/lost-and-found/report-found")}
            >
              <Search className="w-5 h-5 ml-2" /> أبلغ عن شيء وجدته
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default LostAndFound;


