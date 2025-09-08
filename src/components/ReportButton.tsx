import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Flag, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportButtonProps {
  contentType: 'news' | 'comment' | 'job' | 'profile' | 'user';
  contentId: string;
  className?: string;
}

export const ReportButton: React.FC<ReportButtonProps> = ({
  contentType,
  contentId,
  className = ""
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reportReasons = [
    { value: 'spam', label: 'سبام' },
    { value: 'inappropriate', label: 'محتوى غير مناسب' },
    { value: 'harassment', label: 'تحرش' },
    { value: 'fake_news', label: 'أخبار كاذبة' },
    { value: 'other', label: 'أخرى' }
  ];

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول لإرسال بلاغ",
        variant: "destructive"
      });
      return;
    }

    if (!reason) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار سبب البلاغ",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_content_type: contentType,
          reported_content_id: contentId,
          report_reason: reason,
          description: description.trim() || null
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إرسال البلاغ وسيتم مراجعته قريباً",
      });

      setOpen(false);
      setReason('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال البلاغ",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-muted-foreground hover:text-red-600 ${className}`}
        >
          <Flag className="h-4 w-4 ml-1" />
          بلاغ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            إرسال بلاغ
          </DialogTitle>
          <DialogDescription>
            يرجى اختيار سبب البلاغ وإضافة تفاصيل إضافية إذا لزم الأمر
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">سبب البلاغ</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="اختر سبب البلاغ" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">تفاصيل إضافية (اختياري)</Label>
            <Textarea
              id="description"
              placeholder="اكتب تفاصيل إضافية عن البلاغ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="flex-1"
            >
              {submitting ? "جاري الإرسال..." : "إرسال البلاغ"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};