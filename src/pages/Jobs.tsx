import { useState } from "react";
import { Briefcase, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Jobs = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'employer' | 'jobseeker' | null>(null);

  if (!userType) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/business")}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">وظائف وفرص</h1>
          </div>

          {/* User Type Selection */}
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                اختر نوع حسابك
              </h2>
              <p className="text-muted-foreground">
                لنقدم لك التجربة الأنسب حسب احتياجك
              </p>
            </div>

            <div className="space-y-6">
              {/* Employer Button */}
              <Card 
                className="p-8 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50"
                onClick={() => setUserType('employer')}
              >
                <div className="flex items-center justify-center space-x-6 space-x-reverse">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      أنا صاحب عمل
                    </h3>
                    <p className="text-muted-foreground">
                      أبحث عن موظف أو عامل
                    </p>
                  </div>
                </div>
              </Card>

              {/* Job Seeker Button */}
              <Card 
                className="p-8 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50"
                onClick={() => setUserType('jobseeker')}
              >
                <div className="flex items-center justify-center space-x-6 space-x-reverse">
                  <div className="bg-secondary/10 p-4 rounded-full">
                    <Search className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      أنا باحث عن عمل
                    </h3>
                    <p className="text-muted-foreground">
                      أبحث عن فرصة عمل
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder for employer/jobseeker views
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setUserType(null)}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {userType === 'employer' ? 'رحلة صاحب العمل' : 'رحلة الباحث عن عمل'}
          </h1>
        </div>

        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {userType === 'employer' 
              ? 'سيتم تطوير واجهة صاحب العمل قريباً'
              : 'سيتم تطوير واجهة الباحث عن عمل قريباً'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Jobs;