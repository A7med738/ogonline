import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/ui/glass-card'
import { Bell, BellOff, Smartphone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface PushToken {
  id: string
  token: string
  device_info: any
}

export const PushNotificationSettings = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tokens, setTokens] = useState<PushToken[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPushTokens()
    }
  }, [user])

  const fetchPushTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('push_tokens')
        .select('id, token, device_info')
        .eq('user_id', user?.id)

      if (error) throw error

      setTokens(data || [])
    } catch (error) {
      console.error('Error fetching push tokens:', error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل إعدادات الإشعارات",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleNotifications = async (enabled: boolean) => {
    if (!user) return

    setUpdating(true)
    try {
      if (enabled) {
        // Re-enable notifications by keeping existing tokens
        toast({
          title: "تم تفعيل الإشعارات",
          description: "ستحصل على إشعارات الأخبار الجديدة على جهازك",
        })
      } else {
        // Disable notifications by removing all tokens
        const { error } = await supabase
          .from('push_tokens')
          .delete()
          .eq('user_id', user.id)

        if (error) throw error

        setTokens([])
        toast({
          title: "تم إيقاف الإشعارات",
          description: "لن تحصل على إشعارات على جهازك بعد الآن",
        })
      }
    } catch (error) {
      console.error('Error updating notification settings:', error)
      toast({
        title: "خطأ",
        description: "فشل في تحديث إعدادات الإشعارات",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const removeSpecificToken = async (tokenId: string) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('id', tokenId)

      if (error) throw error

      setTokens(prev => prev.filter(token => token.id !== tokenId))
      
      toast({
        title: "تم إلغاء الاشتراك",
        description: "تم إلغاء الاشتراك من هذا الجهاز بنجاح"
      })
    } catch (error) {
      console.error('Error removing token:', error)
      toast({
        title: "خطأ",
        description: "فشل في إلغاء الاشتراك",
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

  const hasActiveTokens = tokens.length > 0
  const deviceName = tokens[0]?.device_info?.deviceType || "الجهاز المحمول"

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-gradient-primary p-3 rounded-full">
            {hasActiveTokens ? (
              <Bell className="h-6 w-6 text-white" />
            ) : (
              <BellOff className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <Label htmlFor="push-notifications" className="text-base font-semibold">
              إشعارات الجهاز المحمول
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              احصل على إشعارات فورية للأخبار الجديدة على جهازك
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          {hasActiveTokens && (
            <Smartphone className="h-4 w-4 text-primary" />
          )}
          <Switch
            id="push-notifications"
            checked={hasActiveTokens}
            onCheckedChange={toggleNotifications}
            disabled={updating}
          />
        </div>
      </div>
      
      {hasActiveTokens ? (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-primary font-medium flex items-center">
            <Smartphone className="h-4 w-4 ml-2" />
            مفعل على {deviceName} - ستحصل على إشعارات فورية
          </p>
          {tokens.length > 1 && (
            <p className="text-xs text-muted-foreground mt-1">
              مفعل على {tokens.length} أجهزة إضافية
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-muted">
          <p className="text-sm text-muted-foreground flex items-center">
            <BellOff className="h-4 w-4 ml-2" />
            غير مفعل - لن تحصل على إشعارات على هذا الجهاز
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            لتفعيل الإشعارات، افتح التطبيق على جهازك المحمول وامنح الصلاحيات
          </p>
        </div>
      )}

      {tokens.length > 1 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">الأجهزة المتصلة:</p>
          {tokens.map((token, index) => (
            <div key={token.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm text-muted-foreground">
                {token.device_info?.deviceType || `جهاز ${index + 1}`}
              </span>
              <button
                onClick={() => removeSpecificToken(token.id)}
                disabled={updating}
                className="text-xs text-destructive hover:text-destructive/80 disabled:opacity-50"
              >
                إلغاء الاشتراك
              </button>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
