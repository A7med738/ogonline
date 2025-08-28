import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/ui/glass-card'
import { Mail, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface EmailSubscription {
  id: string
  subscribed: boolean
}

export const EmailSubscription = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<EmailSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('email_subscriptions')
        .select('id, subscribed')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setSubscription(data)
      } else {
        // Create subscription if it doesn't exist
        const { data: newSubscription, error: createError } = await supabase
          .from('email_subscriptions')
          .insert([{
            user_id: user?.id,
            email: user?.email,
            subscribed: true
          }])
          .select('id, subscribed')
          .single()

        if (createError) throw createError
        setSubscription(newSubscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل إعدادات النشرة الإخبارية",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSubscription = async (subscribed: boolean) => {
    if (!subscription) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .update({ subscribed })
        .eq('id', subscription.id)

      if (error) throw error

      setSubscription({ ...subscription, subscribed })
      
      toast({
        title: subscribed ? "تم تفعيل الاشتراك" : "تم إيقاف الاشتراك",
        description: subscribed 
          ? "ستحصل على إشعارات الأخبار الجديدة عبر الإيميل" 
          : "لن تحصل على إشعارات الأخبار الجديدة عبر الإيميل"
      })
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast({
        title: "خطأ",
        description: "فشل في تحديث الاشتراك",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse flex items-center space-x-4 space-x-reverse">
          <div className="rounded-full bg-muted h-12 w-12"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-gradient-primary p-3 rounded-full">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <Label htmlFor="email-notifications" className="text-base font-semibold">
              النشرة الإخبارية
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              احصل على إشعارات الأخبار الجديدة والحصرية عبر الإيميل
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          {subscription?.subscribed && (
            <Bell className="h-4 w-4 text-primary" />
          )}
          <Switch
            id="email-notifications"
            checked={subscription?.subscribed || false}
            onCheckedChange={toggleSubscription}
            disabled={updating}
          />
        </div>
      </div>
      
      {subscription?.subscribed && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-primary font-medium flex items-center">
            <Bell className="h-4 w-4 ml-2" />
            مفعل - ستحصل على إشعارات الأخبار الجديدة
          </p>
        </div>
      )}
    </GlassCard>
  )
}