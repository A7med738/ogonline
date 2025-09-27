import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ReportButton } from './ReportButton'

interface NewsInteractionsProps {
  newsId: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string
  } | null
}

export const NewsInteractions = ({ newsId }: NewsInteractionsProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLikes()
    fetchComments()
  }, [newsId])

  const fetchLikes = async () => {
    try {
      // Get total likes count
      const { count } = await supabase
        .from('news_likes')
        .select('*', { count: 'exact', head: true })
        .eq('news_id', newsId)

      setLikesCount(count || 0)

      // Check if current user liked this news
      if (user) {
        const { data } = await supabase
          .from('news_likes')
          .select('id')
          .eq('news_id', newsId)
          .eq('user_id', user.id)
          .maybeSingle()

        setIsLiked(!!data)
      }
    } catch (error: any) {
      console.error('Error fetching likes:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('news_comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('news_id', newsId)
        .order('created_at', { ascending: false })

      if (error) throw error
      const mapped = (data || []).map((c: any) => ({ ...c, profiles: null }));
      setComments(mapped)
    } catch (error: any) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "قم بتسجيل الدخول للتفاعل مع الأخبار",
        variant: "destructive"
      })
      return
    }

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('news_likes')
          .delete()
          .eq('news_id', newsId)
          .eq('user_id', user.id)

        if (error) throw error
        setIsLiked(false)
        setLikesCount(prev => prev - 1)
      } else {
        // Add like
        const { error } = await supabase
          .from('news_likes')
          .insert({
            news_id: newsId,
            user_id: user.id
          })

        if (error) throw error
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error: any) {
      toast({
        title: "خطأ في التفاعل",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleComment = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "قم بتسجيل الدخول لإضافة تعليق",
        variant: "destructive"
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "تعليق فارغ",
        description: "يرجى كتابة تعليق قبل الإرسال",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('news_comments')
        .insert({
          news_id: newsId,
          user_id: user.id,
          content: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      await fetchComments()
      
      toast({
        title: "تم إضافة التعليق",
        description: "شكراً لك على التفاعل"
      })
    } catch (error: any) {
      toast({
        title: "خطأ في إضافة التعليق",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('news_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      await fetchComments()
      toast({
        title: "تم حذف التعليق",
        description: "تم حذف التعليق بنجاح"
      })
    } catch (error: any) {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-white/10">
      {/* Interactions Bar */}
      <div className="flex items-center space-x-4 space-x-reverse">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center space-x-2 space-x-reverse ${
            isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 space-x-reverse text-muted-foreground hover:text-primary"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length}</span>
        </Button>
        
        <ReportButton 
          contentType="news" 
          contentId={newsId} 
        />
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4">
          {/* Add Comment */}
          {user && (
            <div className="space-y-2">
              <Textarea
                placeholder="اكتب تعليقك هنا..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-right min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleComment}
                  disabled={loading || !newComment.trim()}
                  size="sm"
                  className="bg-gradient-primary hover:shadow-elegant"
                >
                  <Send className="h-4 w-4 ml-2" />
                  {loading ? 'جاري الإرسال...' : 'إرسال'}
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                لا توجد تعليقات بعد. كن أول من يعلق!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white/5 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 space-x-reverse text-sm">
                        <span className="font-semibold text-primary">
                          {comment.profiles?.full_name || 'مستخدم'}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: ar
                          })}
                        </span>
                      </div>
                      <p className="text-foreground mt-1 text-right">
                        {comment.content}
                      </p>
                    </div>
                    
                    {user && user.id === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {!user && (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">
                قم بتسجيل الدخول للتفاعل مع الأخبار
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/auth'}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                تسجيل الدخول
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}